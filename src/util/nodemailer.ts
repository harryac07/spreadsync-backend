import * as nodemailer from 'nodemailer';

/**
 * This will be replaced by AWS SES or something else in future versions
 * or at least real smtp will be provided
 */
const transporter = nodemailer.createTransport({
  direct: true,
  host: process.env.EMAIL_SENDER_SMTP_HOST,
  auth: {
    user: process.env.EMAIL_SENDER_ACCOUNT,
    pass: process.env.EMAIL_SENDER_PASSWORD,
  },
  secure: true,
});

/**
 * sendEmail
 * @param {Object}payload - payload for email setup
 * @param {String}payload.email - email address for sending email
 * @param {String}payload.subject - email subject
 * @param {String}payload.body - email body
 */
const sendEmail = async ({ email, subject, body }) => {
  const mailOptions = {
    from: `Spreadsync <${process.env.EMAIL_SENDER_ACCOUNT}>`,
    to: email,
    subject: subject,
    html: body,
  };
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Email sending error: ', error);
        reject(error);
      } else {
        resolve(info.message);
      }
    });
  });
};

export {
  sendEmail,
};
