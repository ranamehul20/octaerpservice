import nodemailer from 'nodemailer';
import {WELCOME_TITLE_EMAIL,WELCOME_MESSAGE_EMAIL} from "./constants.js";
import dotenv from 'dotenv';

dotenv.config();

const emailSmtpString = process.env.EMAIL_SMTP;
const emailSmtpConfig = JSON.parse(emailSmtpString);
const smtpHost = emailSmtpConfig.host || 'localhost';
const smtpPort = emailSmtpConfig.port || 587;
const smtpUsername = emailSmtpConfig.username || '';
const smtpPassword = emailSmtpConfig.password || '';

// Set up transporter for GoDaddy SMTP
const transporter = nodemailer.createTransport({
  host: smtpHost, // GoDaddy SMTP server
  port: smtpPort,                      // Secure SMTP port
  secure: true,                   // Use SSL
  auth: {
    user: smtpUsername,  // Your GoDaddy email
    pass: smtpPassword,          // Your GoDaddy email password
  },
});

// Function to send email
export const sendWelcomeEmail = async (userEmail, password) => {
  const mailOptions = {
    from: `"Octa ERP Service" <${smtpUsername}>`,           // Sender address
    to: userEmail,                                 // Recipient email
    subject: WELCOME_TITLE_EMAIL,        // Subject
    text: `${WELCOME_MESSAGE_EMAIL} ${password}`,
    html: `<p>${WELCOME_MESSAGE_EMAIL} <strong>${password}</strong></p>`,
  };
  try {
    // Wait for the email to be sent
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent: ' + info.response);
    return info; // You can return the info if you need to use it later
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error if you want to handle it later
  }
};


// sendEmail
export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Octa ERP Service" <${smtpUsername}>`,
    to,
    subject,
    text,
  };
  try {
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent: ' + info.response);
  return info; // You can return the info if you need to use it later
} catch (error) {
  console.error('Error sending email:', error);
  throw error; // Rethrow the error if you want to handle it later
}
};