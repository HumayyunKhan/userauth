const express = require('express');
const admin = require('./admin.controller');
const { validate } = require('../../helpers');
// const {blockUser,inValidateToken}=require('./admin.controller')
// const { checkToken: Auth } = require('../../middleware/tokenAuth');
// const { superAdminAndPharmacyAuth } = require('../../middleware/CheckRole');
// const checkRestrictedRoute = require("../../middleware/CheckRestrictedRoute");

const router = express.Router(); // eslint-disable-line new-cap

router.post('/invalidateToken', admin.inValidateToken);

router.post('/blockUser', admin.blockUser);


module.exports = router;
