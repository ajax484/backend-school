// const nodemailer = require('nodemailer');
import nodemailer from "nodemailer";
import { default as dotenv } from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASS,
  },
});

export function sendMail(mail) {
  const options = {
    from: process.env.mail,
    ...mail,
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
      return false;
    }

    console.log("email sent" + info.response);
    return true;
  });
}
