import express from 'express'
import *as Controller from '../controlller/controller/api.js'
import userVerify from '../middleware/userVerify.js'
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
import connection from '../connection/connection.js'; // Ensure this imports your database connection

const router =express.Router()

router.post('/save'  , Controller.upload, Controller.save)
router.get('/fetch' ,Controller.fetch)
router.post('/login', userVerify, Controller.login);
router.delete('/delete', Controller.deleteUser);
router.patch('/edit/:id', Controller.upload, Controller.editUser);
router.post('/reset-password', Controller.resetPassword);
router.post('/forgot-password', Controller.forgotPassword);
router.get('/checkmail', Controller.checkmail);
router.get('/verify/:token', (req, res) => {
  const { token } = req.params;
  const secret = 'your_jwt_secret_key';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(400).json({ message: 'Invalid or expired token' }); // Send a JSON error message
    }

    const { email } = decoded;

    const query = 'UPDATE usersDetail SET verified = TRUE WHERE email = ?';
    connection.query(query, [email], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }


        const transporter = nodemailer.createTransport({
          service : 'gmail',
          auth : {
            user: 'python@ashagramtrust.org',
            pass: 'jnvk wufa fyrw fdwt',
          }

        })

        const mailOptions = {
          from: 'python@ashagramtrust.org',
          to: email,
          subject:'Confirmation of Registration Successfull',
          html: ` <h1>congratulations </h1> you are successfully registered with us with your email:  ${email}
          <h3> Now you can Login with login cridentials as you set  </h3>`
        };

        transporter.sendMail (mailOptions),(err, info) =>{
          if (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({ message: 'Error sending email' });
          } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({ message: 'mail sent' });
          }
        }

      return res.status(200).json({ message: 'Email verified successfully!' }); // Send a JSON response
    });
  });
});

export default router