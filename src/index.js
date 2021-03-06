require('dotenv').config()

const logger = require('console-files')
const express = require('express')
const bodyParser = require('body-parser')
const errorHandler = require('./middlewares/errorHandler')
const app = express()
const routes = require('./routes')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', routes)

app.use(errorHandler)

app.listen(process.env.STOREFRONT_CI_PORT || 3000, () => {
  logger.log('storefront app is a live...')
})
