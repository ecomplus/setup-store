const _ = require('lodash')
const Joi = require('joi')
const Schemas = require('../schemas')

module.exports = (useJoiError = false) => {
  const _useJoiError = _.isBoolean(useJoiError) && useJoiError
  const _supportedMethods = ['post']

  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  }

  return (req, res, next) => {
    const route = req.route.path
    const method = req.method.toLowerCase()

    if (_.includes(_supportedMethods, method) && _.has(Schemas, route)) {
      const _schema = _.get(Schemas, route)
      if (_schema) {
        return Joi.validate(req.body, _schema, _validationOptions, (err, data) => {
          if (err) {
            const JoiError = {
              status: 'failed',
              error: {
                original: err._object,
                details: _.map(err.details, ({ path, message, type }) => ({
                  path: path.join('.'),
                  message: message.replace(/['"]/g, ''),
                  type
                }))
              }
            }

            const customError = {
              status: 'failed',
              error: 'Invalid request data!'
            }

            res.status(422).json(_useJoiError ? JoiError : customError)
          } else {
            req.body = data
            next()
          }
        })
      }
    }

    next()
  }
}
