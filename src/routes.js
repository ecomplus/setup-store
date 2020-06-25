const express = require('express')
const router = express.Router()
const logger = require('console-files')

const handler = (func) => (req, res) => {
  try {
    func(req, res)
  } catch (err) {
    logger.error(err)
    res.send('Oh no, something did not go well!')
  }
}

const SchemaValidator = require('./middlewares/SchemaValidator')

const validateRequest = SchemaValidator(true)

const deploy = require('./api/deploy')

router.post('/deploy', validateRequest, handler(deploy))

module.exports = router
