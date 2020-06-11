const logger = require('console-files')
const uuid = require('uuid/v4')
const axios = require('axios').create({
  baseURL: process.env.STOREFRONT_CI_GITGATEWAY_URL,
  headers: {
    Authorization: `Bearer ${process.env.STOREFRONT_CI_OPERATOR_TOKEN}`
  }
})

class GitGateway {
  deploy (payload) {
    return new Promise((resolve, reject) => {
      this.createInstance(payload)
        .then(({ data }) => resolve(data))
        .catch(({ response }) => {
          const error = { step: 'git-gateway', error: response.data }
          logger.error(error)
          return reject(error)
        })
    })
  }

  createInstance (payload) {
    return new Promise((resolve, reject) => {
      const storeId = payload.gotrue.store_id ? payload.gotrue.store_id : payload.settings.store_id
      const owner = payload.owner ? payload.owner : process.env.STOREFRONT_CI_GITHUB_DEFAULT_OWNER
      const headers = {
        Authorization: `Bearer ${process.env.STOREFRONT_CI_OPERATOR_TOKEN}`
      }
      const data = {
        uuid: uuid(),
        store_id: payload.gotrue.store_id,
        config: {
          jwt: {
            secret: process.env.STOREFRONT_CI_JWT_TOKEN
          },
          github: {
            access_token: process.env.STOREFRONT_CI_GITHUB_TOKEN,
            repo: `${owner}/${payload.name}`
          },
          roles: [`s${storeId}`]
        }
      }
      axios.post('/instances', data, headers)
        .then(result => resolve(result))
        .catch(error => reject(error))
    })
  }
}

module.exports = new GitGateway()
