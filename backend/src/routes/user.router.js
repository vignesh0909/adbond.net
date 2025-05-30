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

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userModel.getUserByEmail(email);
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
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
                profile_image_url: user.profile_image_url,
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
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
                profile_image_url: user.profile_image_url,
                linkedin_profile: user.linkedin_profile,
                identity_verified: user.identity_verified,
                last_login: user.last_login,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
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

module.exports = router;