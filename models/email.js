const nodemailer = require("nodemailer");
require("dotenv").config();

const { M_USER, M_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  secure: false,
  auth: {
    user: M_USER,
    pass: M_PASS,
  },
});

const email = async (html, subject, to) => {
  const info = await transporter.sendMail({
    from: '"Mailgun Test 👻" <thatcompany@gmail.com>',
    to,
    subject,
    html,
  });
};

module.exports = {
  email,
};
