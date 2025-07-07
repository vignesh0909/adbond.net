const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    // Configure with your email service
    // For development, you can use a service like Gmail or a testing service like Ethereal
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const emailService = {
    // Send email verification
    async sendVerificationEmail(email, firstName, token) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'AdBond <noreply@adbond.com>',
            to: email,
            subject: 'Verify your AdBond account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AdBond!</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName},</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Thanks for signing up with AdBond! To complete your account setup, please verify your email address by clicking the button below:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      text-decoration: none; 
                                      padding: 15px 30px; 
                                      border-radius: 8px; 
                                      font-weight: bold; 
                                      display: inline-block;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            If the button doesn't work, you can also copy and paste this link into your browser:
                            <br>
                            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                        </p>
                        
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            This verification link will expire in 24 hours. If you didn't create an account with AdBond, please ignore this email.
                        </p>
                    </div>
                    
                    <div style="background: #333; padding: 20px; text-align: center;">
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            © ${new Date().getFullYear()} AdBond. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${email}`);
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    },

    // Send identity verification success email
    async sendIdentityVerificationSuccess(email, firstName, verificationMethod) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'AdBond <noreply@adbond.com>',
            to: email,
            subject: 'Identity Verification Successful - AdBond',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Identity Verified!</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName},</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Great news! Your identity has been successfully verified via ${verificationMethod === 'linkedin' ? 'LinkedIn profile' : 'business domain email'}.
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            You now have access to:
                        </p>
                        
                        <ul style="color: #666; font-size: 16px; line-height: 1.6;">
                            <li>Full contact details in the affiliate company database</li>
                            <li>Direct communication with verified partners</li>
                            <li>Enhanced networking opportunities</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/database" 
                               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                      color: white; 
                                      text-decoration: none; 
                                      padding: 15px 30px; 
                                      border-radius: 8px; 
                                      font-weight: bold; 
                                      display: inline-block;">
                                Explore Database
                            </a>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Identity verification success email sent to ${email}`);
        } catch (error) {
            console.error('Error sending identity verification email:', error);
            // Don't throw error here as it's not critical
        }
    },

    // Send affiliate contact email
    async sendAffiliateContactEmail(contactData) {
        const {
            senderName,
            senderEmail,
            senderCompany,
            recipientName,
            recipientEmail,
            offerRequestTitle,
            messageContent,
            offerRequestDetails
        } = contactData;

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'AdBond <noreply@adbond.com>',
            to: recipientEmail,
            subject: `New Contact Request for "${offerRequestTitle}" - AdBond`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Request</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Someone is interested in your offer request</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Hi ${recipientName},</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                            Great news! <strong>${senderName}</strong> from <strong>${senderCompany}</strong> is interested in your offer request and would like to connect with you.
                        </p>
                        
                        <!-- Offer Request Details -->
                        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                📋 Your Offer Request
                            </h3>
                            <p style="color: #333; font-weight: bold; margin: 5px 0;">${offerRequestTitle}</p>
                            ${offerRequestDetails ? `
                                <div style="margin-top: 15px;">
                                    <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Vertical:</strong> ${offerRequestDetails.vertical || 'Not specified'}</p>
                                    <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Traffic Volume:</strong> ${offerRequestDetails.traffic_volume ? (offerRequestDetails.traffic_volume / 1000).toFixed(0) + 'K/day' : 'Not specified'}</p>
                                    <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Payout Type:</strong> ${offerRequestDetails.desired_payout_type || 'Not specified'}</p>
                                    ${offerRequestDetails.geos_targeting && offerRequestDetails.geos_targeting.length > 0 ? `
                                        <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Target GEOs:</strong> ${offerRequestDetails.geos_targeting.join(', ')}</p>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Contact Information -->
                        <div style="background: #e8f5e8; border: 1px solid #d4edda; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">
                                👤 Contact Information
                            </h3>
                            <p style="color: #155724; margin: 5px 0;"><strong>Name:</strong> ${senderName}</p>
                            <p style="color: #155724; margin: 5px 0;"><strong>Company:</strong> ${senderCompany}</p>
                            <p style="color: #155724; margin: 5px 0;"><strong>Email:</strong> ${senderEmail}</p>
                        </div>
                        
                        ${messageContent ? `
                            <!-- Message -->
                            <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">
                                    💬 Personal Message
                                </h3>
                                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; font-style: italic;">
                                    "${messageContent}"
                                </p>
                            </div>
                        ` : ''}
                        
                        <!-- Call to Action -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="mailto:${senderEmail}?subject=Re: ${offerRequestTitle}&body=Hi ${senderName},%0D%0A%0D%0AThank you for your interest in my offer request. I'd be happy to discuss this opportunity further.%0D%0A%0D%0ABest regards,%0D%0A${recipientName}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      text-decoration: none; 
                                      padding: 15px 30px; 
                                      border-radius: 8px; 
                                      font-weight: bold; 
                                      display: inline-block;
                                      margin-right: 15px;">
                                Reply via Email
                            </a>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                               style="background: #28a745; 
                                      color: white; 
                                      text-decoration: none; 
                                      padding: 15px 30px; 
                                      border-radius: 8px; 
                                      font-weight: bold; 
                                      display: inline-block;">
                                View in Dashboard
                            </a>
                        </div>
                        
                        <!-- Additional Info -->
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                💡 <strong>Tip:</strong> This contact was made through AdBond's secure platform. All communications are tracked for quality and security purposes.
                            </p>
                        </div>
                        
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            This email was sent through AdBond's affiliate marketplace. If you believe this is spam or you want to unsubscribe from these notifications, please contact our support team.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #333; padding: 20px; text-align: center;">
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            © ${new Date().getFullYear()} AdBond. All rights reserved.
                        </p>
                        <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #667eea; text-decoration: none;">Visit AdBond</a> | 
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/support" style="color: #667eea; text-decoration: none;">Support</a>
                        </p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Affiliate contact email sent to ${recipientEmail}`);
            return { success: true, message: 'Email sent successfully' };
        } catch (error) {
            console.error('Error sending affiliate contact email:', error);
            throw new Error('Failed to send contact email');
        }
    },

    // Send admin notification when entity registers
    async sendAdminNotificationEmail(entity) {
        try {
            console.log(`[EMAIL SERVICE] Sending admin notification for new entity registration: ${entity.name} (${entity.entity_id})`);
            
            // Verify admin email configuration before sending
            if (!process.env.ADMIN_EMAIL_USER || !process.env.ADMIN_EMAIL_FROM) {
                console.error('ADMIN_EMAIL_USER and ADMIN_EMAIL_FROM environment variables must be set');
                return { 
                    success: false, 
                    error: 'Admin email configuration incomplete. Check ADMIN_EMAIL_USER and ADMIN_EMAIL_FROM environment variables.' 
                };
            }

            // Default frontend URL if not set in environment
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

            // Create email content with improved styling
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🚨 New Entity Registration</h1>
                        <p style="color: #ffebee; margin: 10px 0 0 0; font-size: 16px;">Requires Admin Review</p>
                    </div>
                    
                    <div style="padding: 30px; background: white; margin: 0;">
                        <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
                            New ${entity.entity_type.charAt(0).toUpperCase() + entity.entity_type.slice(1)} Registration
                        </h2>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                            <h3 style="color: #dc3545; margin-top: 0;">Entity Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555; width: 150px;">Name:</td><td style="padding: 8px 0;">${entity.name}</td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Type:</td><td style="padding: 8px 0;"><span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${entity.entity_type.toUpperCase()}</span></td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${entity.email}" style="color: #dc3545;">${entity.email}</a></td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Website:</td><td style="padding: 8px 0;"><a href="${entity.website}" target="_blank" style="color: #dc3545;">${entity.website}</a></td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Description:</td><td style="padding: 8px 0;">${entity.description}</td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Registration:</td><td style="padding: 8px 0;">${new Date(entity.created_at).toLocaleString()}</td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Entity ID:</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${entity.entity_id}</td></tr>
                            </table>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
                            <h4 style="color: #1976d2; margin-top: 0;">Contact Information</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                ${entity.contact_info.phone ? `<li><strong>Phone:</strong> ${entity.contact_info.phone}</li>` : ''}
                                ${entity.contact_info.teams ? `<li><strong>Microsoft Teams:</strong> ${entity.contact_info.teams}</li>` : ''}
                                ${entity.contact_info.linkedin ? `<li><strong>LinkedIn:</strong> <a href="${entity.contact_info.linkedin}" target="_blank" style="color: #1976d2;">${entity.contact_info.linkedin}</a></li>` : ''}
                                ${entity.contact_info.telegram ? `<li><strong>Telegram:</strong> ${entity.contact_info.telegram}</li>` : ''}
                                ${entity.contact_info.address ? `<li><strong>Address:</strong> ${entity.contact_info.address}</li>` : ''}
                            </ul>
                            ${entity.secondary_email ? `<p><strong>Secondary Email:</strong> <a href="mailto:${entity.secondary_email}" style="color: #1976d2;">${entity.secondary_email}</a></p>` : ''}
                        </div>
                        
                        ${entity.additional_notes ? `
                        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <h4 style="color: #856404; margin-top: 0;">Additional Notes</h4>
                            <p style="margin: 0; color: #856404;">${entity.additional_notes}</p>
                        </div>` : ''}
                        
                        ${entity.how_you_heard ? `
                        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                            <h4 style="color: #0c5460; margin-top: 0;">How They Found Us</h4>
                            <p style="margin: 0; color: #0c5460;">${entity.how_you_heard}</p>
                        </div>` : ''}
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
                            <h4 style="color: #495057; margin-top: 0;">Entity Metadata</h4>
                            <pre style="background: white; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #dee2e6; font-size: 12px; color: #495057;">${JSON.stringify(entity.entity_metadata, null, 2)}</pre>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${frontendUrl}/adminpanel" 
                               style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                                      color: white; 
                                      text-decoration: none; 
                                      padding: 15px 30px; 
                                      border-radius: 8px; 
                                      font-weight: bold; 
                                      display: inline-block; 
                                      margin: 10px;">
                                Review in Admin Panel
                            </a>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="color: #6c757d; margin: 0; font-style: italic;">
                                Please review this entity registration and update their verification status accordingly.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #343a40; padding: 20px; text-align: center; color: #6c757d;">
                        <p style="margin: 0; font-size: 14px;">
                            This is an automated notification from the AdBond System
                        </p>
                        <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 12px;">
                            <a href="${frontendUrl}" style="color: #dc3545; text-decoration: none;">Visit AdBond</a> | 
                            <a href="${frontendUrl}/adminpanel" style="color: #dc3545; text-decoration: none;">Admin Panel</a>
                        </p>
                    </div>
                </div>
            `;

            // Email options
            const mailOptions = {
                from: process.env.ADMIN_EMAIL_FROM || process.env.EMAIL_FROM || 'AdBond System <admin@adbond.net>',
                to: process.env.ADMIN_EMAIL_USER,
                subject: `🚨 New ${entity.entity_type.charAt(0).toUpperCase() + entity.entity_type.slice(1)} Registration: ${entity.name}`,
                html: emailContent
            };

            // Send email
            await transporter.sendMail(mailOptions);
            console.log(`Admin notification email sent successfully to ${process.env.ADMIN_EMAIL_USER} for entity: ${entity.name}`);
            
            return { success: true, message: 'Admin notification email sent successfully' };
            
        } catch (error) {
            console.error('Error sending admin notification email:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to send admin notification email' 
            };
        }
    }
};

module.exports = emailService;
