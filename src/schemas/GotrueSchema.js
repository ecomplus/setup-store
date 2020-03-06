const Joi = require('joi')

const GotrueSchema = Joi.object().keys({
  store_id: Joi.string(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
})


module.exports = GotrueSchema