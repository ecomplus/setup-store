const winston = require('winston')
const path = require('path')

const logger = winston.createLogger({
  level: process.env.STOREFRONT_CI_LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(process.env.STOREFRONT_CI_LOG_PATH || '', 'storefront_ci.log')
    })
  ]
})

logger.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}

module.exports = logger
