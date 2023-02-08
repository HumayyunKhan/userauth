const debug = require('debug')('node-server:auth.controller');
const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
// const axios = require('axios');
const db = require('../../db/models');
// const jwtHelper = require('../../helpers/jwt');
// const { findRecord } = require('../../helpers/db/FindOne');
const config = require('../../config/index');
// const SendEmail = require('../../helpers/SendEmail');
// const RemoveWhitespace = require('../../helpers/RemoveWhitespace');

const saltRounds = 10;
class Admin {
  register = async (req, res) => {
    try {
      let user;
      let username;
      // req.body.phone = RemoveWhitespace(req.body.phone);
      user = await db.Users.findOne({
        where: {
          email: req.body.email,
        },
      });
      username = await db.Users.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (user) {
        return res.status(httpStatus.CONFLICT).send({
          status: false,
          message: 'User with same email already exists!',
        });
      }
      if (username) {
        return res.status(httpStatus.CONFLICT).send({
          status: false,
          message: 'User with same username already exists!',
        });
      }
      const result = await db.sequelize.transaction(async (t) => {
        // first create a pharmacy
        const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = await db.Users.create(
          {
            username: req.body.username,
            avatar: req.body.avatar,
            email: req.body.email,
            password: passwordHash,
            role: req.body.role,
            activestatus: req.body.activestatus,
            suspendedstatus: req.body.suspendedstatus
          },
          {
            transaction: t,
          }
        );
       console.log("Created User:",newUser)

      return newUser;
    });
        const record = await db.Users.findOne({
          where: {
            id: parseInt(await result.id),
          }})

      return res.send({
        status: true,
        data: record,
        message: 'Data created successfully!',
      });
    } catch (error) {
      console.log(error)
      debug(error); // eslint-disable-line no-console
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong on server side!',
      });
    }
  };
   blockUser = async(req, res)=>{
    try{

      console.log("req.body",req.body.email)
    await db.Users.update(
        {suspendedstatus:1,
          
        },
        {
          where: {
            email:req.body.email,
          },
        }
      ).then((res,error)=>{
        console.log(res)
        console.log(error)
        

      })
      return res.send({
        status: true,
        message: 'Blocked successfully!',
      });
    }catch(err){
      console.log(err)
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong on server side!',
      });
    }
}
   inValidateToken=async(req,res)=>{
    try{
    await db.Users.update(
        {
          token:null,
        },
        {
          where: {
            email:req.body.email,
          },
        }
      ).then((res,error)=>{
        console.log(res)
        console.log(error)
        if(error){
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
            status: false,
            message: 'Something went wrong on server side!',
          });

        }
      })
      return res.send({
        status: true,
        message: 'token successfully invalidated',
      });
    }catch(err){
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong on server side!',
      });
    }
}



}

module.exports = new Admin();
