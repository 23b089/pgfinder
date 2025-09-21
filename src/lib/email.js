import 'server-only';
import nodemailer from 'nodemailer';

// Server-side email sender using environment variables.
// Required env vars: EMAIL_USER, EMAIL_APP_PASSWORD
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    const hint = 'Missing EMAIL_USER or EMAIL_APP_PASSWORD environment variables.';
    // In dev, throw with a helpful message; in production, fail fast.
    throw new Error(hint);
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    // Normalize a helpful error
    if (String(error?.message || '').toLowerCase().includes('invalid login') || error?.code === 'EAUTH') {
      throw new Error('Email auth failed. Check EMAIL_USER and EMAIL_APP_PASSWORD (Gmail App Password).');
    }
    throw new Error('Failed to send email. Please check mail server configuration.');
  }
}

export default sendEmail;