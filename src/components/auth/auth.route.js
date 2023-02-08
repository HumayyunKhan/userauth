const express = require('express');
const auth = require('./auth.controller');
const { validate } = require('../../helpers');
const {
  register, login, createUser, forgotPassword, resetPassword,
} = require('./auth.validation');
// const { checkToken: Auth } = require('../../middleware/tokenAuth');
// const { superAdminAndPharmacyAuth } = require('../../middleware/CheckRole');
// const checkRestrictedRoute = require("../../middleware/CheckRestrictedRoute");

const router = express.Router(); // eslint-disable-line new-cap

router.post('/register',validate(register), auth.register);

router.post('/login',validate(login), auth.login);

router.post(
  '/password/forgot',
  validate(forgotPassword),
  auth.forgotPassword
);
router.post(
  '/password/reset',
  validate(resetPassword),
  auth.resetPassword
);
module.exports = router;
