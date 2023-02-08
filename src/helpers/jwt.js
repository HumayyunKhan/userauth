const jwt = require('jsonwebtoken');
const ncrypt = require('ncrypt-js');
const config = require('../config/index');

const ncryptObj = new ncrypt(config.jwtSecret); // eslint-disable-line new-cap

module.exports = {
  issue(payload, expiresIn) {
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: expiresIn || '24h',
    });
    // encrypt the token for further security
    return ncryptObj.encrypt(token);
  },
  verify(token) {
    try {
      // decrypt the token
      token = ncryptObj.decrypt(token); // eslint-disable-line no-param-reassign
      return jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return false;
    }
  },
  issueUnEncrypted(payload, expiresIn) {
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: expiresIn || '24h',
    });
    // encrypt the token for further security
    return token;
  },
  verifyUnEncrypted(token) {
    try {
      // eslint-disable-line no-param-reassign
      return jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return false;
    }
  },
};
