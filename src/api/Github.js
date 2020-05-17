const { Octokit } = require('@octokit/rest')
const logger = require('../config/winston')
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
        .then(() => this.createCMSConfig(octokit, payload))
        .then(() => this.getFileContent(octokit, payload, 'content/settings.json', 3000))
        .then(({ data }) => this.updateSettings(octokit, payload, data))
        .then(({ data }) => resolve(data))
        .catch(error => {
          if (error.status) {
            const err = {
              step: 'github',
              status: error.status,
              error: error.statusText,
              details: error.errors,
              documentation_url: error.documentation_url
            }
            logger.error(`${JSON.stringify(err)}`)
            return reject(err)
          }
          logger.error(`${JSON.stringify(error)}`)
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
            return resolve(`${name}-${Math.random() * (9999 - 1000) + 1000}`)
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
      setTimeout(() => {
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
        }).then(res => resolve(res)).catch(err => reject(err))
      }, 30000)
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
}

module.exports = new GitHub()
