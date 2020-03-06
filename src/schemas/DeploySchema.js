const Joi = require('joi')
const GotrueSchema = require('./GotrueSchema')
const SettingsSchema = require('./SettingsSchema')

const DeploySchema = Joi.object().keys({
  name: Joi.string().required(),
  gotrue: GotrueSchema,
  settings: SettingsSchema
})

module.exports = DeploySchema

