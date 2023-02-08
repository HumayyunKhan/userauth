const debug = require('debug')('node-server:auth.controller');
const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const axios = require('axios');
const db = require('../../db/models');
const jwtHelper = require('../../helpers/jwt');
// const { findRecord } = require('../../helpers/db/FindOne');
const config = require('../../config/index');
const SendEmail = require('../../helpers/SendEmail');
// const RemoveWhitespace = require('../../helpers/RemoveWhitespace');

const saltRounds = 10;
class Auth {
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

  login = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    let user;
    try {
      user = await db.Users.findOne({ where: { email:req.body.email }, });
      // user = await db.Users.findOne({
      //   where: {
      //     email: req.body.email,
      //   },
      // });
      if (!user) {
        return res.status(httpStatus.CONFLICT).send({
          status: false,
          message:
            'Email or Password is incorrect, please enter correct credentials.',
        });
 
      }
      if(user.suspendedstatus){
        return res.status(httpStatus.CONFLICT).send({
          status: false,
          message:
            'Blocked User',
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong! please try again.',
      });
    }
    try {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(httpStatus.CONFLICT).send({
          status: false,
          message:
            'Email or Password is incorrect, please enter correct credentials.',
        });
      }
      const token = jwtHelper.issue({ id: user.id, role: user.role });
      console.log(token,"token here")
      delete user.dataValues.password;

      // update login time
      await db.Users.update(
        {activestatus:1,
          token:token,
        },
        {
          where: {
            email:email,
          },
        }
      ).then((res,error)=>{
        console.log(res)
        console.log(error)
      })

      // main login history if user is admin
      const userRole = user.dataValues.role;
      // if (userRole === 'ADMIN' ) {
      //   const ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
      //   const result = await db.LoginHistory.create({
      //     userId: user.id,
      //     ipAddress,
      //   });
      //   if (!result) {
      //     return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      //       status: false,
      //       message: 'Something went wrong on server side!',
      //     });
      //   }
      // }

      return res.send({
        status: true,
        message: 'Login successful.',
        token,
        data: user.dataValues,
      });
    } catch (error) {
      debug(error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong! please try again.',
      });
    }
  };

  // createUser = async (req, res) => {
  //   const { userRole } = req;
  //   const { role } = req.body;
  //   try {
  //     // check if user exists
  //     let result;
  //     let data;
  //     let pharmacy;
  //     let PharmacyId = null;

  //     result = await findRecord(db.User, { id: req.userId });
  //     if (!result) {
  //       return res.status(httpStatus.CONFLICT).send({
  //         status: true,
  //         message: "User doesn't exist!",
  //       });
  //     }
  //     if (req.userRole === 'superadmin') {
  //       PharmacyId = req.body.pharmacyId;
  //     } else {
  //       PharmacyId = result.pharmacyId;
  //     }

  //     // check for roles conflict and throw error if any
  //     if (
  //       (userRole === 'pharmacy' || userRole === 'staff')
  //       && role === 'superadmin'
  //     ) {
  //       return res.status(httpStatus.CONFLICT).send({
  //         status: false,
  //         message: 'Only superadmin can create superadmin!',
  //       });
  //     }
  //     if (userRole === 'pharmacy' && role === 'pharmacy') {
  //       return res.status(httpStatus.CONFLICT).send({
  //         status: false,
  //         message: 'Only superadmin can create pharmacy!',
  //       });
  //     }

  //     if (userRole === 'staff' && (role === 'pharmacy' || role === 'staff')) {
  //       return res.status(httpStatus.CONFLICT).send({
  //         status: false,
  //         message: 'Only superadmin and pharmacy can create staff!',
  //       });
  //     }

  //     const { data: numVerifyResponse } = await axios.get(
  //       // eslint-disable-next-line max-len
  //       `${config.numVerify.url}?access_key=${config.numVerify.accessKey}&number=${req.body.phone}&country_code=AU`
  //     );
  //     if (!numVerifyResponse.valid) {
  //       return res
  //         .status(httpStatus.BAD_REQUEST)
  //         .send({ status: false, message: 'Phone number is not valid.' });
  //     }

  //     // check if user exists with same email
  //     result = await db.User.findOne({
  //       where: { email: req.body.email },
  //     });

  //     if (result) {
  //       return res.status(httpStatus.CONFLICT).send({
  //         status: false,
  //         message: 'Data with same email already exists!',
  //       });
  //     }
  //     req.body.phone = RemoveWhitespace(req.body.phone);
  //     result = await db.User.findOne({
  //       where: { phone: req.body.phone },
  //     });

  //     if (result) {
  //       return res.status(httpStatus.CONFLICT).send({
  //         status: false,
  //         message: 'Data with same phone already exists!',
  //       });
  //     }

  //     // result = await db.User.findOne({
  //     //   where: { pbsNumber: req.body.pharmacy.pbsNumber },
  //     // });

  //     // if (result) {
  //     //   return res.status(httpStatus.CONFLICT).send({
  //     //     status: false,
  //     //     message: 'Data with same pbs number already exists!',
  //     //   });
  //     // }

  //     if (role === 'staff' || role === 'superadmin') {
  //       console.log('Inside staff or superadmin block');
  //       // check if pharmacy with pharmacyId exists
  //       if (role === 'staff') {
  //         const pharmacyData = await db.Pharmacy.findOne({
  //           where: {
  //             id: PharmacyId,
  //           },
  //         });
  //         if (!pharmacyData) {
  //           return res.status(httpStatus.CONFLICT).send({
  //             status: false,
  //             message: "Relevant Pharmacy doesn't exist!",
  //           });
  //         }
  //         req.body.pharmacyId = PharmacyId;
  //       }

  //       const passwordHash = await bcrypt.hash(req.body.password, saltRounds);

  //       data = await db.User.create({
  //         ...req.body,
  //         password: passwordHash,
  //       });
  //       delete data.dataValues.password;
  //     } else {
  //       console.log('Inside pharmacy block');
  //       let { pharmacyPhone, pharmacyMobile } = req.body.pharmacy;
  //       const {
  //         pharmacyAddress,
  //         pharmacyName,
  //         pharmacyEmail,
  //         pbsNumber,
  //         pharmacist,
  //       } = req.body.pharmacy;
  //       pharmacyPhone = RemoveWhitespace(pharmacyPhone);
  //       pharmacyMobile = RemoveWhitespace(pharmacyMobile);
  //       pharmacy = await db.Pharmacy.findOne({
  //         where: {
  //           phone: pharmacyPhone,
  //         },
  //       });
  //       if (pharmacy) {
  //         return res.status(httpStatus.CONFLICT).send({
  //           status: false,
  //           message: 'Pharmacy data with same phone already exists!',
  //         });
  //       }

  //       pharmacy = await db.Pharmacy.findOne({
  //         where: {
  //           address: pharmacyAddress,
  //         },
  //       });
  //       if (pharmacy) {
  //         return res.status(httpStatus.CONFLICT).send({
  //           status: false,
  //           message: 'Pharmacy data with same address already exists!',
  //         });
  //       }

  //       pharmacy = await db.Pharmacy.findOne({
  //         where: {
  //           mobile: pharmacyMobile,
  //         },
  //       });
  //       if (pharmacy) {
  //         return res.status(httpStatus.CONFLICT).send({
  //           status: false,
  //           message: 'Pharmacy data with same mobile already exists!',
  //         });
  //       }

  //       data = await db.sequelize.transaction(async (t) => {
  //         const createdPharmacy = await db.Pharmacy.create(
  //           {
  //             name: pharmacyName,
  //             address: pharmacyAddress,
  //             phone: pharmacyPhone,
  //             email: pharmacyEmail,
  //             pbsNumber,
  //             mobile: pharmacyMobile,
  //             pharmacist,
  //           },
  //           {
  //             transaction: t,
  //           }
  //         );
  //         const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
  //         const createdUser = await db.User.create(
  //           {
  //             pharmacyId: createdPharmacy.id,
  //             name: req.body.name,
  //             email: req.body.email,
  //             phone: req.body.phone,
  //             password: passwordHash,
  //           },
  //           { transaction: t }
  //         );
  //         delete createdUser.dataValues.password;
  //         const record = await db.Pharmacy.findOne({
  //           where: {
  //             id: createdPharmacy.id,
  //           },
  //           include: {
  //             model: db.User,
  //             attributes: {
  //               exclude: ['id', 'pharmacyId', 'createdAt', 'updatedAt'],
  //             },
  //           },
  //           transaction: t,
  //         });
  //         console.log('Record: ', record);
  //         return record;
  //       });
  //     }
  //     if (!data) {
  //       return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
  //         message: 'Something went wrong on server side!',
  //       });
  //     }

  //     return res.send({
  //       status: true,
  //       message: 'Data created successfully!',
  //       data,
  //     });
  //   } catch (error) {
  //     debug(error);
  //     return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
  //       status: false,
  //       message: 'Something went wrong! please try again.',
  //     });
  //   }
  // };

  forgotPassword = async (req, res) => {
    let user = null;
    try {
      const { email } = req.body;
      user = await db.Users.findOne({ where: { email:email} });
      if (!user) {
        return res.send({
          status: true,
          message:
            'Email with Password reset instructions has been sent to your registered email address (fraud).',
        });
      }

      const token = jwtHelper.issueUnEncrypted({ id: user.id }, '1h');
      console.log("--",token,"--")
      const resetEmail = ` <h1>Hello ${user.username}</h1>, 

        <p>please click on the link to reset your password: <a target="_blank" href=${process.env.RESET_URL}?token=${token}> reset password </a></p>
        <p>please copy paste following url in browser if link doesnt work</p>

      <em>${process.env.RESET_URL}?token=${token}</em>
      <hr />
       <p>Link is valid for 1 hour only.</p>
        <p>if you didn't initiate password reset please ignore this email.</p>
      `;
      const message = {
        to: user.email,
        from: process.env.SENDGRID_SENDER, // Change to your verified sender
        subject: 'Password reset - owing',
        html: resetEmail,
      };
      await SendEmail(message);
      return res.send({
        status: true,
        message:
          'Email with Password reset instructions has been sent to your registered email address.',
      });
    } catch (error) {
      console.log(error)
      debug(error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong! please try again.',
      });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { password, token } = req.body;
      const isValid = jwtHelper.verifyUnEncrypted(token);
      if (!isValid) {
        return res.status(httpStatus.UNAUTHORIZED).send({
          status: false,
          message: 'Token invalid',
        });
      }
      const user = await db.Users.findOne({ where: { id: isValid.id } });
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).send({
          status: false,
          message: 'User not found.',
        });
      }
      const isPasswordReused = await bcrypt.compare(password, user.password);
      if (isPasswordReused) {
        return res.status(httpStatus.PRECONDITION_FAILED).send({
          status: false,
          message: 'You cannot use current password as new password.',
        });
      }

      const passwordHash = await bcrypt.hash(password, saltRounds);
      await db.Users.update(
        { password: passwordHash },
        { where: { id: isValid.id } }
      );

      return res.send({
        status: true,
        message: 'Password updated successfull',
      });
    } catch (error) {
      debug(error);
      console.log(error)
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: false,
        message: 'Something went wrong! please try again.',
      });
    }
  };
}

module.exports = new Auth();
