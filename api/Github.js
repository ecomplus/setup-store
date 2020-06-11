const { Octokit } = require('@octokit/rest')
const logger = require('console-files')
const DEFAULT_SETTINGS = require('../config/defaultSettings')

class GitHub {
  constructor() {
    this.templateOwner = process.env.STOREFRONT_CI_GITHUB_TEMPLATE_OWNER
    this.templateRepo = process.env.STOREFRONT_CI_GITHUB_TEMPLATE_REPO
  }

  deploy(payload) {
    return new Promise((resolve, reject) => {
      const octokit = new Octokit({
        auth: process.env.STOREFRONT_CI_GITHUB_TOKEN
      })

      return this.generate(octokit, payload)
        .then(({ data }) => {
          this.handleCommits(octokit, payload)
          resolve(data)
        })
        .catch(error => {
          logger.error(error)
          return reject(error)
        })
    })
  }

  getOwner(payload) {
    return payload.owner ? payload.owner : process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER
  }

  getRepoName(payload) {
    return new Promise((resolve, reject) => {
      const octokit = new Octokit({
        auth: process.env.STOREFRONT_CI_GITHUB_TOKEN
      })
      const owner = this.getOwner(payload)
      const { name } = payload
      octokit.repos.get({
        owner,
        repo: name
      })
        .then(({ status }) => {
          if (status === 200) {
            return resolve(`${name}-${Math.floor(Math.random() * (9999 - 1000) + 1000)}`)
          }
          return resolve(name)
        })
        .catch(err => {
          if (err.status && err.status === 404) {
            return resolve(name)
          }
          return reject(err)
        })
    })

  }

  generate(octokit, payload) {
    return octokit.repos.createUsingTemplate({
      template_owner: this.templateOwner,
      template_repo: this.templateRepo,
      owner: this.getOwner(payload),
      name: payload.name,
      description: payload.description || '',
      private: false
    })
  }

  createCMSConfig(octokit, payload) {
    return new Promise((resolve, reject) => {
      const config = {
        backend: {
          name: 'git-gateway',
          branch: 'master',
          identity_url: `https://gotrue.ecomplus.biz/${payload.gotrue.store_id}/.netlify/identity`,
          gateway_url: `https://gitgateway.ecomplus.biz/${payload.gotrue.store_id}/.netlify/git`
        }
      }

      octokit.repos.createOrUpdateFile({
        owner: process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER,
        repo: payload.name,
        message: 'chore(cms): setup custom backend config [skip ci]',
        path: 'template/public/admin/config.json',
        content: Buffer.from(JSON.stringify(config, null, 2)).toString('base64'),
      })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
  }

  getFileContent(octokit, payload, path, timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        octokit.repos.getContents({
          owner: process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER,
          repo: payload.name,
          path,
        }).then(res => resolve(res)).catch(err => reject(err))
      }, timeout)
    })
  }

  updateSettings(octokit, payload, content) {
    const defaultSettings = { ...DEFAULT_SETTINGS, ...payload.settings || {} }
    return octokit.repos.createOrUpdateFile({
      owner: process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER,
      repo: payload.name,
      message: 'Setup store',
      path: 'content/settings.json',
      content: Buffer.from(JSON.stringify(defaultSettings, null, 2)).toString('base64'),
      sha: content.sha
    })
  }

  handleCommits(octokit, payload, retry = 0) {
    setTimeout(() => {
      this.createCMSConfig(octokit, payload)
        .then(() => this.getFileContent(octokit, payload, 'content/settings.json', 3000))
        .then(({ data }) => this.updateSettings(octokit, payload, data))
        .catch(error => {
          logger.error(error)
          if (retry < 3) {
            this.handleCommits(octokit, payload, retry++)
          }
        })
    }, 120000)
  }
}

module.exports = new GitHub()
