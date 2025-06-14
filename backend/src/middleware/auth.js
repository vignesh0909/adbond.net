const jwt = require('jsonwebtoken');
const { userModel } = require('../models/user.model.pg');

// JWT secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists and is active
        const user = await userModel.getUserById(decoded.user_id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        // Add user info to request object
        req.user = { user_id: decoded.user_id, email: decoded.email, role: decoded.role };
        console.log(`Authenticated user: ${req.user.email} (${req.user.user_id})`);

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Middleware to check user role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.getUserById(decoded.user_id);

            if (user && user.status === 'active') {
                req.user = {
                    user_id: decoded.user_id,
                    email: decoded.email,
                    role: decoded.role
                };
            }
        }

        next();
    } catch (error) {
        // For optional auth, we don't fail on token errors
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth
};
