import nodemailer from 'nodemailer';

// Verify environment variables are set
if (!process.env.APP_EMAIL || !process.env.APP_PASS) {
    console.warn('⚠️ WARNING: APP_EMAIL or APP_PASS environment variables are not set!');
    console.warn('Email functionality will not work. Please set these in your .env file.');
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

// Verify transporter connection
try {
  await transporter.verify();
  console.log("SMTP Ready");
} catch (err) {
  console.error("SMTP ERROR:", err);
}

export default transporter;