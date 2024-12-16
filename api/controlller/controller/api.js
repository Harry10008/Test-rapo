import bcrypt from 'bcryptjs';
import connection from "../../connection/connection.js";
import pkg from 'bcryptjs';
import { response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import axios from 'axios'

const { compare } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  
  fileFilter: (req, file, cb) => {
    
    const allowedTypes = ['image/jpg', 'image/png' , 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg,jpeg and png file types are allowed'), false);
      console.log("Rejected file type");
    }
  }
}).single('imageName'); 

const sendConfirmationEmail = (email, first_name) => {
  // Generate a JWT token
  const secret = 'your_jwt_secret_key'; // Use a secure key for production
  const token = jwt.sign({ email }, secret, { expiresIn: '1h' }); // Expires in 1 hour

  // Create a verification link
  const verificationLink = `http://localhost:4200/verification-mail?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'python@ashagramtrust.org',
      pass: 'jnvk wufa fyrw fdwt',
    },
  });
  
  console.log(email,first_name)
  const mailOptions = {
    from: 'python@ashagramtrust.org',
    to: email,
    subject: 'Verify Your Email',
    html: `<h1>Hi ${first_name}</h1>
           <p>Thank you for registering. Please verify your email by clicking the link below:</p>
           <a href="${verificationLink}">Verify Email</a>
           <p>This link will expire in 1 hour.</p>`,
           
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  // Check if user exists in the database
  const query = 'SELECT * FROM usersDetail WHERE email = ?';
  connection.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result[0];

    // Generate a reset token
    const secret = 'your_jwt_secret_key'; // Use a secure key for production
    const token = jwt.sign({ email }, secret, { expiresIn: '10m' });

    // Create a reset password link
    const resetLink = `http://localhost:4200/resetPassword?token=${token}`;

    // Send email with the reset password link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'python@ashagramtrust.org',
        pass: 'jnvk wufa fyrw fdwt',
      },
    });

    const mailOptions = {
      from: 'python@ashagramtrust.org',
      to: email,
      subject: 'Password Reset Request',
      html: `<h1>Hi ${user.first_name}</h1>
             <p>We received a request to reset your password. Please click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link will expire in 10 minutes.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Password reset link sent to your email.' });
      }
    });
  });
};
export const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;
  const secret = 'your_jwt_secret_key'; 

  // Verify the token
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { email } = decoded;

    // Hash the new password
    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error(hashErr);
        return res.status(500).json({
          response: 'fail',
          message: 'Password hashing failed',
        });
      }

      // Update the user's password in the database
      const query = 'UPDATE usersDetail SET password = ? WHERE email = ?';
      connection.query(query, [hashedPassword, email], (dbErr, result) => {
        if (dbErr) {
          console.error(dbErr);
          return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Password reset successfully' });
      });
    });
  });
};


export const save = (req, res) => {
  try {
    const values = req.body;
    let imagePath = null;

    const { first_name, last_name, email, password, mobile, state, city, address, pin_code, country, user_name, role, gender, short_bio } = values;

    if (req.file) {
      imagePath = `${req.file.filename}`;
      values.imageName = imagePath;
      console.log("imageName after file upload:", imagePath);
    } else {
      console.log("No image uploaded");
    }

    const checkQuery = 'SELECT * FROM usersDetail WHERE email = ? OR user_name = ?';
    connection.query(checkQuery, [email, user_name], (checkErr, checkResult) => {
      if (checkErr) {
        console.error(checkErr);
        return res.status(500).json({
          response: 'fail',
          message: 'Database query failed during uniqueness check',
        });
      }

      if (checkResult.length > 0) {
        // Email or username already exists
        return res.status(400).json({
          response: 'fail',
          message: 'Email or username already exists',
        });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            response: 'fail',
            message: 'Password hashing failed',
          });
        }

        const query =
          'INSERT INTO usersDetail (first_name, last_name, email, password, mobile, state, city, address, pin_code, country, user_name, role, gender, short_bio, imageName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(
          query,
          [first_name, last_name, email, hashedPassword, mobile, state, city, address, pin_code, country, user_name, role, gender, short_bio, imagePath],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                response: 'fail',
                message: 'Database insertion failed',
              });
            }

            // Send a confirmation email to the user
            sendConfirmationEmail(values.email,values.first_name );

            res.status(201).json({
              response: 'success',
              message: 'User created successfully',
            });
          }
        );
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      response: 'fail',
      message: 'An unexpected error occurred',
    });
  }
};



export const fetch = (req, res) => {
  try {
    // Fetch only users with active status = 1
    let query = "SELECT * FROM usersDetail WHERE active = 1 AND role = 'user'  ORDER BY first_name ASC ";

    connection.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({
          response: 'fail',
          message: 'Failed to fetch data',
        });
      } else {
        res.status(200).json({
          response: 'success',
          data: result,
        });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      response: 'fail',
      message: 'An unexpected error occurred',
    });
  }
};



export const login = async (req, res) => {
  const { email, password, recaptcha } = req.body;

  // Step 1: Verify CAPTCHA response
  try {
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: '6LeLQ50qAAAAAA6CzLd0UhIoNMvsYg3encA07Hlf',
          response: recaptcha,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        response: 'fail',
        message: 'Captcha validation failed',
      });
    }
  } catch (err) {
    console.error('Error verifying CAPTCHA:', err);
    return res.status(500).json({
      response: 'fail',
      message: 'Internal server error during CAPTCHA verification',
    });
  }

  // Step 2: Check user credentials
  const query = 'SELECT * FROM usersDetail WHERE email = ?';
  connection.query(query, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        response: 'fail',
        message: 'Database query failed',
      });
    }

    if (result.length === 0) {
      return res.status(400).json({
        response: 'fail',
        message: 'User not found',
      });
    }

    const storedHash = result[0].password;

    // Step 3: Compare passwords
    bcrypt.compare(password, storedHash, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          response: 'fail',
          message: 'Error comparing password',
        });
      }

      if (isMatch) {
        const user = {
          id: result[0].id,
          email: result[0].email,
        };

        // Step 4: Generate JWT token
        const token = jwt.sign(user, 'keykey', { expiresIn: '10m' });  

        // Step 5: Respond with success and send token
        return res.status(200).json({
          response: 'success',
          message: 'Login successful',
          token: token,
          user:result[0].email,
          role: result[0].role,
          validation: result[0].validation,
        });
      } else {
        return res.status(400).json({
          response: 'fail',
          message: 'Invalid password',
        });
      }
    });
  });
};


export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    if (!id) {
      return res.status(400).json({
        response: 'fail',
        message: 'ID is required',
      });
    }

    const {
      first_name,
      last_name,
      email,
      mobile,
      city,
      state,
      country,
      pin_code,
      role,
      short_bio,
      isVarified
    } = userData;

    // Convert isVarified (true/false) to 1/0
    const verifiedStatus = isVarified ? 1 : 0;

    let imagePath = null;

    // Check if a new image file was uploaded
    if (req.file) {
      imagePath = `${req.file.filename}`;
    }

    // Construct the SQL query with the corrected isVarified assignment
    const query = `
      UPDATE usersDetail 
      SET 
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        mobile = ?, 
        city = ?, 
        state = ?, 
        country = ?, 
        pin_code = ?, 
        role = ?, 
        short_bio = ?, 
        verified = ?,  -- Corrected part
        imageName = IFNULL(?, imageName) 
      WHERE id = ?
    `;

    // Prepare the query parameters
    const queryParams = [
      first_name,
      last_name,
      email,
      mobile,
      city,
      state,
      country,
      pin_code,
      role,
      short_bio,
      verifiedStatus,  // Pass the verifiedStatus (1 or 0)
      imagePath,
      id,
    ];

    // Execute the query
    connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({
          response: 'fail',
          message: 'Database error',
        });
      }

      if (result.affectedRows > 0) {
        res.status(200).json({
          response: 'success',
          message: 'User updated successfully',
        });
      } else {
        res.status(404).json({
          response: 'fail',
          message: 'User not found',
        });
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      response: 'fail',
      message: 'Failed to update user',
    });
  }
};



export const deleteUser = (req, res) => {
  try {
    const { id } = req.body; 
    console.log(id);
    
    if (!id) {
      return res.status(400).json({ response: 'fail', message: 'id is required' });
    }

    const query = 'UPDATE usersDetail SET active = 0 WHERE id = ?';

    connection.query(query, [id], (err, response) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ response: 'fail', message: 'Database error' });
      }
      
      if (response.affectedRows > 0) {
        res.status(200).json({ response: 'success', message: 'User deactivated successfully' });
      } else {
        res.status(404).json({ response: 'fail', message: 'User not found' });
      }
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ response: 'fail', message: 'Failed to deactivate user' });
  }
};


