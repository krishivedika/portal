const nodemailer = require('nodemailer');

const config = require("../config");

const sendEmail = (to, subject, html) => {
  const from = 'kvportalnoreply@gmail.com';
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    }
  });
  return transport.sendMail({from, to, subject, html});
};

module.exports = {
  sendEmail,
}
