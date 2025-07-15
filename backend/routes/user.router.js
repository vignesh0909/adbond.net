const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    handleValidationErrors
} = require('../middleware/validation');
const { userModel } = require('../models/user.model.pg');
const emailService = require('../services/emailService');

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

router.post('/register', validateRegistration, handleValidationErrors, async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        if (!first_name || !email || !password) {
            return res.status(400).json({ message: 'First name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await userModel.createUser({ first_name, last_name, email, password, role });

        // Generate and send email verification
        try {
            const verificationData = await userModel.generateEmailVerificationToken(user.user_id);
            await emailService.sendVerificationEmail(email, first_name, verificationData.token);
        } catch (emailError) {
            console.error('Email verification error:', emailError);
            // Continue with registration even if email fails
        }

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                user_id: user.user_id,
                entity_id: user.entity_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
                email_verified: false
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
})

router.post('/login', validateLogin, handleValidationErrors, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email, password);

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userModel.getUserByEmail(email);
        console.log(user)
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Account is not active. Please contact support.' });
        }

        // Check if email is verified (skip for entity users)
        // Entity users (advertisers, affiliates, networks) are pre-approved and don't need email verification
        const isEntityUser = user.entity_id && ['advertiser', 'affiliate', 'network'].includes(user.role);
        if (!user.email_verified && !isEntityUser) {
            return res.status(401).json({ 
                message: 'Please verify your email address before logging in. Check your inbox for a verification link.',
                email_not_verified: true 
            });
        }

        const isValidPassword = await userModel.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if temporary password has expired
        if (user.password_reset_required && user.temp_password_expires) {
            const now = new Date();
            const expiryDate = new Date(user.temp_password_expires);

            if (now > expiryDate) {
                return res.status(401).json({
                    message: 'Your temporary password has expired. Please contact support to reset your password.'
                });
            }
        }

        await userModel.updateLastLogin(user.user_id);

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            password_reset_required: user.password_reset_required,
            user: {
                user_id: user.user_id,
                entity_id: user.entity_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
                profile_image_url: user.profile_image_url,
                password_reset_required: user.password_reset_required,
                linkedin_profile: user.linkedin_profile,
                identity_verified: user.identity_verified,
                email_verified: user.email_verified,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
});

// Protected routes (authentication required)
router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
        const user = await userModel.getUserById(req.user.user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                user_id: user.user_id,
                entity_id: user.entity_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
                profile_image_url: user.profile_image_url,
                linkedin_profile: user.linkedin_profile,
                identity_verified: user.identity_verified,
                password_reset_required: user.password_reset_required,
                last_login: user.last_login,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        next(error);
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            // Return a specific message for better UX while logging the attempt
            console.log(`Password reset attempted for non-existent email: ${email}`);
            return res.status(404).json({ 
                message: 'No account found with this email address. Please check your email or create a new account.',
                code: 'EMAIL_NOT_FOUND'
            });
        }

        // Generate a password reset token (you can implement this in userModel)
        const resetToken = jwt.sign(
            { user_id: user.user_id, email: email, type: 'password_reset' },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send password reset email
        try {
            await emailService.sendPasswordResetEmail(email, user.first_name, resetToken);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            return res.status(500).json({ message: 'Failed to send password reset email. Please try again.' });
        }

        res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        next(error);
    }
});

// Password reset endpoint
router.post('/reset-password', authenticateToken, async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;

        if (!new_password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await userModel.getUserByEmail(req.user.email);

        // Check if the new password is the same as the current password
        const isSamePassword = await userModel.verifyPassword(new_password, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password cannot be the same as your current password. Please choose a different password.' });
        }

        // If not a password reset required case, verify the current password
        if (!user.password_reset_required && current_password) {
            const isValidPassword = await userModel.verifyPassword(current_password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }

        // Check if temp password is expired
        if (user.password_reset_required && user.temp_password_expires) {
            const now = new Date();
            const expiryDate = new Date(user.temp_password_expires);

            if (now > expiryDate) {
                return res.status(400).json({
                    message: 'Temporary password has expired. Please contact support.'
                });
            }
        }

        // Update the password
        await userModel.updatePassword(req.user.user_id, new_password);

        res.json({
            message: 'Password updated successfully',
            password_reset_required: false
        });
    } catch (error) {
        console.error('Password reset error:', error);
        next(error);
    }
});

router.put('/profile/:id', authenticateToken, validateProfileUpdate, handleValidationErrors, async (req, res, next) => {
    try {
        const { first_name, last_name, email, profile_image_url, linkedin_profile } = req.body;

        // Check if user exists
        const user = await userModel.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await userModel.getUserByEmail(email);
            if (existingUser && existingUser.user_id !== req.params.id) {
                return res.status(400).json({ message: 'Email already taken by another user' });
            }
        }

        const updatedUser = await userModel.updateUser(req.params.id, {
            first_name,
            last_name,
            email,
            profile_image_url,
            linkedin_profile
        });

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        next(error);
    }
});

// Get user verification status
router.get('/verification-status', authenticateToken, async (req, res, next) => {
    try {
        const status = await userModel.getUserVerificationStatus(req.user.user_id);
        console.log('User verification status:', status);
        res.json({ 
            success: true,
            data: status,
            status: status // Also include in the status field for backward compatibility
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        next(error);
    }
});

// Admin routes (admin role required)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const users = await userModel.getAllUsers();
        res.json({ users, count: users.length });
    } catch (error) {
        console.error('Get all users error:', error);
        next(error);
    }
});

router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Get user by ID error:', error);
        next(error);
    }
});

router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        // Check if user exists
        const user = await userModel.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userModel.deleteUser(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        next(error);
    }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res, next) => {
    console.log('Email verification token received:', req.params.token);
    try {
        const { token } = req.params;
        const result = await userModel.verifyEmailToken(token);
        console.log('Email verification result:', result);

        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        res.json({
            message: 'Email verified successfully',
            user: result.user
        });
    } catch (error) {
        console.error('Email verification error:', error);
        next(error);
    }
});

// Resend email verification
router.post('/resend-verification', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email_verified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const verificationData = await userModel.generateEmailVerificationToken(user.user_id);
        await emailService.sendVerificationEmail(email, user.first_name, verificationData.token);

        res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        next(error);
    }
});

// Identity verification endpoints
router.post('/verify-identity', authenticateToken, async (req, res, next) => {
    try {
        const { verification_method, linkedin_profile, business_email } = req.body;
        const user_id = req.user.user_id;

        if (!verification_method || !['linkedin', 'business_email'].includes(verification_method)) {
            return res.status(400).json({ message: 'Valid verification method is required' });
        }

        // Prepare verification data
        let verificationData = {};
        let isValid = false;

        if (verification_method === 'linkedin' && linkedin_profile) {
            // Validate LinkedIn profile URL format
            isValid = linkedin_profile.includes('linkedin.com/in/');
            verificationData.linkedin_profile = linkedin_profile;
        } else if (verification_method === 'business_email' && business_email) {
            // Check if business email domain matches a known business domain
            const businessDomains = ['company.com', 'business.org', 'corp.com']; // Example domains
            const domain = business_email.split('@')[1];
            isValid = businessDomains.includes(domain) || !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain);
            verificationData.business_email = business_email;
        }

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification data provided' });
        }

        const result = await userModel.updateIdentityVerification(user_id, verification_method, verificationData);

        // Send success email
        try {
            const user = await userModel.getUserById(user_id);
            await emailService.sendIdentityVerificationSuccess(user.email, user.first_name, verification_method);
        } catch (emailError) {
            console.error('Error sending verification success email:', emailError);
        }

        res.json({
            success: true,
            message: 'Identity verified successfully',
            verification: result
        });
    } catch (error) {
        console.error('Identity verification error:', error);
        next(error);
    }
});

module.exports = router;