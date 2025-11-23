const nodemailer = require('nodemailer');
const axios = require('axios')
const pug = require('pug');
// const ejs = require('ejs');
const htmlToText = require('html-to-text');


module.exports = class Email {
  constructor(data) {
    // console.log(`sending email to ${data.element}`);
    this.title = data.titleForm
    this.senderEmail = data.senderEmail
    this.subject = data.subjectForm
    this.message = data.message
    this.secure = data.secure
    this.host = data.host
    this.port = data.port
    this.email_user = data.email_user
    this.email_password = data.email_password
    this.to = data.element
    this.tls = data.tls
    this.ssl = data.ssl
  }

  newTransport() {
    // console.log('new transport smtp!');
    return nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      tls: {
        rejectUnauthorized: this.tls
      },
      auth: {
        user: this.email_user,
        pass: this.email_password
      }
    });
  }

  // Send the actual email
  async send() {
    const html = this.message
    // 2) Define email options
    const mailOptions = {
      from: ` ${this.title} <${this.senderEmail}>`,
      bcc: this.to,
      subject: this.subject,
      html: html,
      text: htmlToText.fromString(this.message),
      envelope: {
        from: `${this.title} <${this.senderEmail}>`,
        to: this.to,
      }
    };

    // 3) Create a transport and send email
    const result = await this.newTransport().sendMail(mailOptions);
    const data = {
      "result": result,
      "subject": this.subject,
      "message": this.message
    }
    return data
  }

};