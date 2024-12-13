import nodemailer from 'nodemailer'

// emailService.js

const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can replace this with any SMTP service
  auth: {
    user: 'your-email@gmail.com', // Your email address
    pass: 'your-email-password',  // Your email password or app-specific password
  },
});

// Function to send an email
const sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: 'your-email@gmail.com', // Sender's email address
    to: to, // Recipient's email address
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body (optional)
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent: ' + info.response);
    })
    .catch(err => {
      console.log('Error sending email: ', err);
    });
};

module.exports = {
  sendEmail,
};
