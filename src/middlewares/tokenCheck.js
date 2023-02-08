const httpStatus = require('http-status');
const jwtHelper = require('../helpers/jwt');
const db =require( )

// eslint-disable-next-line consistent-return
const checkToken = (req, res, next) => {
  let token = req.headers.authorization;

  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    const isVerified = jwtHelper.verify(token);
    if (isVerified) {
      req.userId = isVerified.id;
      req.userRole = isVerified.role;
      next();
    } else {
      res.status(httpStatus.CONFLICT);
      return res.json({
        success: false,
        message: 'Token is not valid.',
      });
    }
  } else {
    res.status(httpStatus.BAD_REQUEST);
    return res.json({
      success: false,
      message: 'Protected route!, Please provide authorization token.',
    });
  }
};

module.exports = {
  checkToken,
};
