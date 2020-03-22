const logger = require('../config/winston')
const axios = require('axios').create({
  baseURL: process.env.STOREFRONT_CI_NETLIFY_URL,
  headers: {
    Authorization: `Bearer ${process.env.STOREFRONT_CI_NETLIFY_TOKEN}`
  }
})

class Netlify {
  deploy (payload) {
    return new Promise((resolve, reject) => {
      this.createSite(payload)
        .then(({ data }) => this.updateSiteWithRepo(payload, data))
        .then(({ data }) => resolve(data))
        .catch(({ response }) => {
          const error = { step: 'netlify', status: response.status, error: response.data }
          logger.error(`${JSON.stringify(error)}`)
          return reject(error)
        })
    })
  }

  createSite (payload, retry = false) {
    return new Promise((resolve, reject) => {
      const name = retry ? `${payload.name}-${Math.random() * (9999 - 1000) + 1000}` : payload.name
      const data = { name }
      axios.post('/sites', data)
        .then(result => resolve(result))
        .catch(error => {
          if (error.response && error.response.status === 422 && !retry) {
            return this.createSite(payload, true)
              .then(result => resolve(result))
              .catch(error => reject(error))
          }
          return reject(error)
        })
    })
  }

  updateSiteWithRepo (payload, siteData) {
    return new Promise((resolve, reject) => {
      const owner = payload.owner ? payload.owner : process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER
      const data = {
        repo: {
          provider: process.env.STOREFRONT_CI_NETLIFY_PROVIDER || 'github',
          installation_id: process.env.STOREFRONT_CI_NETLIFY_GITHUB_INSTALATION_ID,
          repo: `${owner}/${payload.name}`,
          private: false,
          env: { },
          branch: process.env.STOREFRONT_CI_NETLIFY_BRANCH || 'dist'
        }
      }
      axios.put(`/sites/${siteData.id}`, data)
        .then(result => resolve(result))
        .catch(error => reject(error))
    })
  }
}

module.exports = new Netlify()
