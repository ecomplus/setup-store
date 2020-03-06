const express = require('express')
const router = express.Router()
const SchemaValidator = require('./middlewares/SchemaValidator')

const validateRequest = SchemaValidator(true)

const deploy = require('./api/deploy')

router.post('/deploy', validateRequest, deploy)

module.exports = router