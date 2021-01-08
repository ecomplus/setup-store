
const logger = require('console-files')
const uuid = require('uuid/v4')

const sqlite3 = require('sqlite3').verbose()

const axios = require('axios').create({
  baseURL: process.env.STOREFRONT_CI_GITGATEWAY_URL,
  headers: {
    Authorization: `Bearer ${process.env.STOREFRONT_CI_OPERATOR_TOKEN}`
  }
})

class GitGateway {
  deploy (payload) {
    return new Promise((resolve, reject) => {
      this.removeOldInstance(payload)
        .then(payload => this.createInstance(payload))
        .then(({ data }) => resolve(data))
        .catch((err) => {
          const error = { step: 'git-gateway', error: err}
          if (err && err.response) {
            error.error = err.response.data
          }
          logger.error(error)
          return reject(error)
        })
    })
  }

  removeOldInstance(payload) {
    return new Promise((resolve, reject) => {
      if (!process.env.STOREFRONT_CI_GIT_GATEWAY_DB_PATH) {
        return reject('ENV STOREFRONT_CI_GIT_GATEWAY_DB_PATH not found')
      }
      let db = new sqlite3.Database(process.env.STOREFRONT_CI_GIT_GATEWAY_DB_PATH, sqlite3.OPEN_READWRITE, (error) => {
        if (error) {
          return reject(error)
        }
      })

      db.serialize(() => {
        const sql = `DELETE FROM instances WHERE raw_base_config like '%"roles":["s${payload.gotrue.store_id}"]%'`
        db.run(sql, {}, (error) => {
          if (error) {
            return reject(error)
          }
          resolve(payload)
        })
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
