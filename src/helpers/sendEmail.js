const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SendEmail = async (options) => {
  try {
    await sgMail.send(options);
    return true;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = SendEmail;
