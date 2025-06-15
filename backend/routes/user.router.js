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

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                user_id: user.user_id,
                entity_id: user.entity_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status
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

// TEMPORARY: Fix test user entity_id
router.post('/fix-test-user', async (req, res, next) => {
    try {
        const { pool } = require('../models/db_connection');

        // Update user entity_id to existing entity
        const updateUserQuery = `
            UPDATE users 
            SET entity_id = $1 
            WHERE email = $2 
            RETURNING user_id, entity_id, email, first_name, last_name;
        `;

        const result = await pool.query(updateUserQuery, ['e9e18836-9c0b-4b13-a4c8-715cf2470d39', 'testuser@example.com']);
        
        res.json({
            message: 'Test user fixed',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Fix test user error:', error);
        next(error);
    }
});

module.exports = router;