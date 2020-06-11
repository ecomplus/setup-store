const logger = require('console-files')

const qs = require('qs')
const axios = require('axios').create({
  baseURL: process.env.STOREFRONT_CI_GOTRUE_URL,
  timeout: 1000
})

class GoTrue {
  constructor() {
    this.username = process.env.STOREFRONT_CI_GOTRUE_USERNAME
    this.password = process.env.STOREFRONT_CI_GOTRUE_PASSWORD
  }

  deploy(payload) {
    return new Promise((resolve, reject) => {
      this.login()
        .then(() => this.createUser(payload))
        .then(({ data }) => this.updateRule(payload, data))
        .then(({ data }) => resolve(data))
        .catch(error => {
          if (error.response) {
            const { response } = error
            const err = { step: 'gotrue', status: response.status, error: response.data }
            logger.error(error)
            return reject(err)
          }
          logger.error(error)
          return reject(error)
        })
    })
  }

  login() {
    return new Promise((resolve, reject) => {
      try {
        const headers = {
          'Content-Type': 'application/x-www-form-urlencodedcharset=UTF-8'
        }
        const options = qs.stringify({
          grant_type: 'password',
          username: this.username,
          password: this.password
        })
        axios.post('/token', options, headers)
          .then(({ data }) => resolve(this.updateHeadersWithToken(data)))
          .catch(error => reject(error))
      } catch (error) {
        throw new Error(error)
      }
    })
  }

  updateHeadersWithToken({ access_token }) {
    axios.defaults.headers.Authorization = `Bearer ${access_token}`
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      axios.get('/admin/users')
        .then(result => resolve(result))
        .catch(error => reject(error))
    })
  }

  getUser(email, users) {
    return users.find(user => user.email == email)
  }

  createUser(payload) {
    return new Promise((resolve, reject) => {
      const { gotrue } = payload
      this.getUsers()
        .then(({ data }) => {
          const user = this.getUser(gotrue.email, data.users)
          if (user) {
            user.password = gotrue.password
            return resolve({ data: user })
          }
          return axios.post('/admin/users', { ...gotrue, confirm: true })
            .then(result => resolve(result))
            .catch(error => reject(error))
        })
        .catch(error => reject(error))
    })
  }

  updateRule(payload, gotrueUser) {
    return new Promise((resolve, reject) => {
      const storeId = payload.gotrue.store_id ? payload.gotrue.store_id : payload.settings.store_id
      const roles = gotrueUser.app_metadata.roles ? gotrueUser.app_metadata.roles : []
      const newRoles = Array.from(new Set([`s${storeId}`, ...roles]))
      const data = {
        password: gotrueUser.password,
        app_metadata: {
          roles: newRoles
        }
      }
      axios.put(`admin/users/${gotrueUser.id}`, data)
        .then(result => resolve(result))
        .catch(error => reject(error))
    })
  }
}

module.exports = new GoTrue()
