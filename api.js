const Router = require('express');
const api = Router();
const { Request, Response } = require('express');
require('dotenv').config()
const db = require('./src/db/models');

function nocache(req, res, next) {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Expires', '0');
  res.header('Pragma', 'no-cache');
  return next();
}

// todo: implement CORS
// api.get('*', cors());

api.get('/', function(req, res) {
  return res.json({ message: 'hello world ⚡️'});
});
api.get('/users', async function(req, res) {
  let data = await db.Users.findAll({ })
  // return res.json({ message: 'hello world ⚡️'});
  return res.send({ message: 'hello world ALL USERS',Data:data});
});



api.get('/_status', nocache, function(req, res) {
  return res.json({ status: 'OK' });
});


module.exports = api;