'use strict';

module.exports = function WriteoutError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};

require('util').inherits(module.exports, Error);


function _(id, defaultMessage, httpStatusCode) {
    return function(message) {
      return new WriteoutError(message || defaultMessage, id, httpStatusCode);
    };
  }

const authFailed = _(101, "That phone number is already registered", 400);

module.exports = { authFailed };