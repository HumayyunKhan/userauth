const { Joi } = require('express-validation');

const paramValidation = {
  register: {
    body: Joi.object({
      avatar: Joi.string().required(),
      username: Joi.string().required(),
      activestatus: Joi.boolean().default(true),
      suspendedstatus: Joi.boolean().default(false),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      token: Joi.string(),
      role: Joi.string().default('USER'),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
};

module.exports = paramValidation;
