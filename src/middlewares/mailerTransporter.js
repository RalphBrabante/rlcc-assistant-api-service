// emailTransporter.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "test@sysgage.com",
    pass: "[s1Vss9pIVp",
  },
});

function mailerTransporter(req, res, next) {
  req.transporter = transporter; // attach transporter to request object
  next();
}

module.exports = mailerTransporter;
