require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const routes = require('./routes')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', routes)


app.listen(process.env.STOREFRONT_CI_PORT || 3000, () => {
  console.log(`storefront app is a live...`)
})



