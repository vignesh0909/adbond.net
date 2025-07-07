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
        // IMPORTANT: This function should ONLY be called when an entity is approved by admin
        // It should NEVER be called during entity registration
        console.log(`[MAILER] Sending welcome email for approved entity: ${entity.name} (${entity.entity_id})`);
        
        // Audit log for debugging
        const auditLog = {
            timestamp: new Date().toISOString(),
            event: 'WELCOME_EMAIL_TRIGGERED',
            entity_id: entity.entity_id,
            entity_name: entity.name,
            recipient_email: user.email,
            stack_trace: new Error().stack
        };
        console.log('[EMAIL_AUDIT_LOG]', JSON.stringify(auditLog));
        
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
            <h2>Welcome to Adbond.net!</h2>
            
            <p>Congratulations! Your entity <strong>"${entity.name}"</strong> has been approved!</p>
            
            <h3>Your Login Details:</h3>
            <p><strong>Email:</strong> ${user.email}<br>
            <strong>Temporary Password:</strong> ${tempPassword}</p>
            
            <p style="color: red;"><strong>Important:</strong> Please login and change your password immediately. 
            This temporary password will expire in 24 hours.</p>
            
            <p><a href="${frontendUrl}/login" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Login Now</a></p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            Adbond.net Team</p>
        `;

        // Email sender address
        const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@adbond.net';

        // Email options
        const mailOptions = {
            from: fromEmail,
            to: user.email,
            subject: 'Welcome to Adbond.net - Your Account is Ready',
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
        console.log(`[MAILER SUCCESS] Welcome email sent to ${user.email} for entity ${entity.name}: %s`, info.messageId);
        
        // Log the event with timestamp for debugging
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: 'WELCOME_EMAIL_SENT',
            entity_id: entity.entity_id,
            entity_name: entity.name,
            recipient_email: user.email,
            message_id: info.messageId
        };
        console.log('[EMAIL_AUDIT_LOG]', JSON.stringify(logEntry));
        
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

async function sendAdminNotificationEmail(entity) {
    try {
        console.log(`[MAILER] Sending admin notification for new entity registration: ${entity.name} (${entity.entity_id})`);
        
        // Verify admin email configuration before sending
        if (!process.env.ADMIN_EMAIL_USER || !process.env.ADMIN_EMAIL_FROM) {
            console.error('ADMIN_EMAIL_USER and ADMIN_EMAIL_FROM environment variables must be set');
            return { 
                success: false, 
                error: 'Admin email configuration incomplete. Check ADMIN_EMAIL_USER and ADMIN_EMAIL_FROM environment variables.' 
            };
        }

        // Default frontend URL if not set in environment
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log(`Sending admin notification to ${process.env.ADMIN_EMAIL_USER} for new entity registration: ${entity.name}`);

        // Create email content
        const emailContent = `
            <h2>New Entity Registration - ${entity.entity_type.toUpperCase()}</h2>
            
            <p>A new entity has registered and is pending verification:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Entity Details:</h3>
                <p><strong>Name:</strong> ${entity.name}</p>
                <p><strong>Type:</strong> ${entity.entity_type}</p>
                <p><strong>Email:</strong> ${entity.email}</p>
                <p><strong>Website:</strong> ${entity.website}</p>
                <p><strong>Description:</strong> ${entity.description}</p>
                <p><strong>Contact Info:</strong></p>
                <ul>
                    ${entity.contact_info.phone ? `<li>Phone: ${entity.contact_info.phone}</li>` : ''}
                    ${entity.contact_info.teams ? `<li>Microsoft Teams: ${entity.contact_info.teams}</li>` : ''}
                    ${entity.contact_info.linkedin ? `<li>LinkedIn: ${entity.contact_info.linkedin}</li>` : ''}
                    ${entity.contact_info.telegram ? `<li>Telegram: ${entity.contact_info.telegram}</li>` : ''}
                    ${entity.contact_info.address ? `<li>Address: ${entity.contact_info.address}</li>` : ''}
                </ul>
                ${entity.secondary_email ? `<p><strong>Secondary Email:</strong> ${entity.secondary_email}</p>` : ''}
                ${entity.additional_notes ? `<p><strong>Additional Notes:</strong> ${entity.additional_notes}</p>` : ''}
                ${entity.how_you_heard ? `<p><strong>How they heard about us:</strong> ${entity.how_you_heard}</p>` : ''}
                <p><strong>Registration Date:</strong> ${new Date(entity.created_at).toLocaleString()}</p>
                <p><strong>Entity ID:</strong> ${entity.entity_id}</p>
                <p><strong>Verification Status:</strong> ${entity.verification_status}</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>Entity Metadata:</h4>
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(entity.entity_metadata, null, 2)}</pre>
            </div>
            
            <p><a href="${frontendUrl}/adminpanel" style="background-color: #2196F3; color: white; padding: 12px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; margin: 10px 5px;">Review in Admin Panel</a></p>
            
            <p style="color: #666; font-size: 14px;">Please review this entity and update their verification status accordingly.</p>
            
            <p>Best regards,<br>
            AdBond System</p>
        `;

        // Email options
        const mailOptions = {
            from: process.env.ADMIN_EMAIL_FROM,
            to: process.env.ADMIN_EMAIL_USER,
            subject: `New ${entity.entity_type} Registration: ${entity.name}`,
            html: emailContent
        };

        // Verify the SMTP connection before sending
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully for admin notification');
        } catch (verifyError) {
            console.error('SMTP connection verification failed for admin notification:', verifyError);
            return { 
                success: false, 
                error: `SMTP connection failed: ${verifyError.message}. Check your email provider settings.` 
            };
        }

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAILER SUCCESS] Admin notification email sent to ${process.env.ADMIN_EMAIL_USER} for entity ${entity.name}: %s`, info.messageId);
        
        // Log the event with timestamp for debugging
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: 'ADMIN_NOTIFICATION_EMAIL_SENT',
            entity_id: entity.entity_id,
            entity_name: entity.name,
            entity_type: entity.entity_type,
            recipient_email: process.env.ADMIN_EMAIL_USER,
            message_id: info.messageId
        };
        console.log('[EMAIL_AUDIT_LOG]', JSON.stringify(logEntry));
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending admin notification email:', error);
        
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

module.exports = { sendWelcomeEmail, sendAdminNotificationEmail };