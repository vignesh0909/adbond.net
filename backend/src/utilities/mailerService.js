// Email service for sending login credentials
const nodemailer = require('nodemailer');
require('dotenv').config();

// Log email configuration (without sensitive data)
console.log('Email Configuration:');
console.log('- HOST:', process.env.EMAIL_HOST || '(using default)');
console.log('- PORT:', process.env.EMAIL_PORT || '(using default)');
console.log('- SECURE:', process.env.EMAIL_SECURE || '(using default)');
console.log('- USER:', process.env.EMAIL_USER ? '(set)' : '(using default)');
console.log('- FROM:', process.env.EMAIL_FROM || '(using default)');

// Create a transporter
let transporter;

// Use Gmail as a default if no specific provider is configured
if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST === 'smtp.gmail.com') {
    // For Gmail
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''  // App password for Gmail
        }
    });
} else {
    // For other email providers
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        }
    });
}

async function sendWelcomeEmail(entity, user, tempPassword) {
    try {
        // Verify email configuration before sending
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('EMAIL_USER and EMAIL_PASS environment variables must be set');
            return { 
                success: false, 
                error: 'Email configuration incomplete. Check EMAIL_USER and EMAIL_PASS environment variables.' 
            };
        }

        // Default frontend URL if not set in environment
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log(`Sending welcome email to ${user.email} for entity ${entity.name}`);

        // Create email content
        const emailContent = `
            <h2>Welcome to LinkedIn.us!</h2>
            
            <p>Congratulations! Your entity <strong>"${entity.name}"</strong> has been approved!</p>
            
            <h3>Your Login Details:</h3>
            <p><strong>Email:</strong> ${user.email}<br>
            <strong>Temporary Password:</strong> ${tempPassword}</p>
            
            <p style="color: red;"><strong>Important:</strong> Please login and change your password immediately. 
            This temporary password will expire in 24 hours.</p>
            
            <p><a href="${frontendUrl}/login" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Login Now</a></p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            LinkedIn.us Team</p>
        `;

        // Email sender address
        const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@linkindin.us';

        // Email options
        const mailOptions = {
            from: fromEmail,
            to: user.email,
            subject: 'Welcome to LinkedIn.us - Your Account is Ready',
            html: emailContent
        };

        // Verify the SMTP connection before sending
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP connection verification failed:', verifyError);
            return { 
                success: false, 
                error: `SMTP connection failed: ${verifyError.message}. Check your email provider settings.` 
            };
        }

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        
        // Provide more detailed error information
        let errorMsg = error.message;
        if (error.code === 'EAUTH') {
            errorMsg = 'Authentication failed. Check your email username and password.';
        } else if (error.code === 'ESOCKET') {
            errorMsg = 'Connection failed. Check host and port settings.';
        } else if (error.code === 'ECONNECTION') {
            errorMsg = 'Connection error. Check network settings and email provider status.';
        }
        
        return { 
            success: false, 
            error: errorMsg,
            details: error.message, 
            code: error.code || 'UNKNOWN'
        };
    }
}

module.exports = { sendWelcomeEmail };