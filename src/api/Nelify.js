const axios = require('axios').create({
  baseURL: process.env.STOREFRONT_CI_NETLIFY_URL,
  headers: {
    'Authorization': `Bearer ${process.env.STOREFRONT_CI_NETLIFY_TOKEN}`
  }
})

class Netlify {
  deploy(payload) {
    return new Promise((resolve, reject) => {
      this.createSite(payload)
      .then(({ data }) => this.updateSiteWithRepo(payload, data))
      .then(({data}) => resolve(data))
      .catch(({response}) => reject({
        setep: 'netlify',
        status: response.status,
        error: response.statusText,
        details: response.data.errors
      }))
    })
  }

  createSite(payload) {
    return new Promise((resolve, reject) => {
      const data = { "name": payload.name }
      axios.post('/sites', data)
        .then(result => resolve(result))
        .catch(error => reject(error))
    })
  }

  updateSiteWithRepo(payload, siteData) {
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