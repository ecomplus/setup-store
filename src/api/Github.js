const { Octokit } = require('@octokit/rest')
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
        .then(() => this.getSettingsContent(octokit, payload))
        .then(({ data }) => this.updateSettings(octokit, payload, data))
        .then(({ data }) => resolve(data))
        .catch(error => reject({
          step: 'github',
          status: error.status,
          error: error.statusText,
          details: error.errors,
          documentation_url: error.documentation_url
        }))
    })
  }

  generate(octokit, payload) {
    return octokit.repos.createUsingTemplate({
      template_owner: this.templateOwner,
      template_repo: this.templateRepo,
      owner: payload.owner ? payload.owner : process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER,
      name: payload.name,
      description: payload.description || '',
      private: false,
    })
  }

  createCMSConfig(octokit, payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const config = {
          backend: {
            name: "git-gateway",
            branch: "master",
            identity_url: `https://gotrue.ecomplus.biz/${payload.gotrue.store_id}/.netlify/identity`,
            gateway_url: `https://gitgateway.ecomplus.biz/${payload.gotrue.store_id}/.netlify/git`
          }
        }

        octokit.repos.createOrUpdateFile({
          owner: process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER,
          repo: payload.name,
          message: 'chore cms setup custom backend config [skip ci]',
          path: 'template/public/admin/config.json',
          content: Buffer.from(JSON.stringify(config, null, 2)).toString('base64'),
        }).then(res => resolve(res)).catch(err => reject(err))
      }, 10000)
    })

  }

  getSettingsContent(octokit, payload) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        octokit.repos.getContents({
          owner: process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER,
          repo: payload.name,
          path: 'content/settings.json'
        }).then(res => resolve(res)).catch(err => reject(err))
      }, 3000)
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