import nodemailer from 'nodemailer';

// Verify environment variables are set
if (!process.env.APP_EMAIL || !process.env.APP_PASS) {
    console.warn('⚠️ WARNING: APP_EMAIL or APP_PASS environment variables are not set!');
    console.warn('Email functionality will not work. Please set these in your .env file.');
}

const transporter = nodemailer.createTransport({
   service: "gmail",
    auth:{
        user : process.env.APP_EMAIL,
        pass: process.env.APP_PASS 
    }
})

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter configuration error:', error.message);
    } else {
        console.log('✅ Email transporter is ready');
    }
});

export default transporter;