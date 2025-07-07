const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegistration = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    
    body('last_name')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('role')
        .optional()
        .isIn(['user', 'advertiser', 'affiliate', 'network', 'admin'])
        .withMessage('Invalid role specified')
];

// Validation rules for user login
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for user profile update
const validateProfileUpdate = [
    body('first_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    
    body('last_name')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('profile_image_url')
        .optional()
        .isURL()
        .withMessage('Profile image URL must be a valid URL'),
    
    body('linkedin_profile')
        .optional()
        .isURL()
        .withMessage('LinkedIn profile must be a valid URL')
];

// Validation rules for entity registration
const validateEntityRegistration = [
    body('entity_type')
        .notEmpty()
        .withMessage('Entity type is required')
        .isIn(['advertiser', 'affiliate', 'network'])
        .withMessage('Entity type must be one of: advertiser, affiliate, network'),
    
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Entity name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Entity name must be between 2 and 200 characters'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('website_url')
        .trim()
        .notEmpty()
        .withMessage('Website is required')
        .isURL({ protocols: ['http', 'https'] })
        .withMessage('Please provide a valid website URL'),
    
    body('contact_info')
        .isObject()
        .withMessage('Contact info must be an object')
        .custom((value, { req }) => {
            const hasPhone = value.phone && typeof value.phone === 'string' && value.phone.trim() !== '';
            if (!hasPhone) {
                throw new Error('Phone number is required in contact_info and cannot be empty.');
            }
            return true;
        }),
    
    // body('contact_info.phone')
    //     .optional()
    //     .matches(/^\+?[\d\s\-\(\)]+$/)
    //     .withMessage('Please provide a valid phone number'),
    
    // body('contact_info.telegram')
    //     .optional()
    //     .trim()
    //     .isLength({ min: 3, max: 50 })
    //     .withMessage('Telegram username must be between 3 and 50 characters'),
    
    // body('contact_info.teams')
    //     .optional()
    //     .trim()
    //     .isLength({ min: 3, max: 100 })
    //     .withMessage('Teams contact must be between 3 and 100 characters'),

    // body('contact_info.linkedin')
    //     .optional()
    //     .isURL()
    //     .withMessage('LinkedIn profile must be a valid URL'),

    // body('contact_info.address')
    //     .trim() // Ensure it's a string and not empty, handled by custom validator now for presence
    //     .isLength({ min: 5, max: 500 })
    //     .withMessage('Address must be between 5 and 500 characters'),

    body('secondary_email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid secondary email')
        .normalizeEmail(),

    body('additional_notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Additional notes must be less than 2000 characters'),

    body('how_you_heard')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('How you heard must be less than 200 characters'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    
    body('entity_metadata')
        .isObject()
        .withMessage('Entity metadata must be an object'),
    
    body('image_url')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
    
    body('additional_request')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Additional request must be less than 1000 characters')
];

// Validation rules for entity update
const validateEntityUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Entity name must be between 2 and 200 characters'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('website')
        .optional()
        .trim()
        .isURL({ protocols: ['http', 'https'] })
        .withMessage('Please provide a valid website URL'),
    
    body('contact_info')
        .optional()
        .isObject()
        .withMessage('Contact info must be an object')
        .custom((value) => {
            if (value && !value.phone && !value.telegram && !value.teams && !value.linkedin && !value.address) {
                throw new Error('At least one contact method is required (phone, telegram, teams, linkedin, or address)');
            }
            return true;
        }),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    
    body('entity_metadata')
        .optional()
        .isObject()
        .withMessage('Entity metadata must be an object'),
    
    body('image_url')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
    
    body('is_public')
        .optional()
        .isBoolean()
        .withMessage('is_public must be a boolean value')
];

// Validation rules for verification status update
const validateVerificationUpdate = [
    body('verification_status')
        .notEmpty()
        .withMessage('Verification status is required')
        .isIn(['pending', 'approved', 'rejected', 'on_hold'])
        .withMessage('Verification status must be one of: pending, approved, rejected, on_hold'),
    
    body('admin_notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Admin notes must be less than 1000 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    validateEntityRegistration,
    validateEntityUpdate,
    validateVerificationUpdate,
    handleValidationErrors
};
