require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const winston = require('./config/winston')
const errorHandler = require('./middlewares/errorHandler')
const app = express()
const routes = require('./routes')

app.use(morgan('combined', { stream: winston.stream }))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', routes)

app.use(errorHandler)

app.listen(process.env.STOREFRONT_CI_PORT || 3000, () => {
  console.log('storefront app is a live...')
})
