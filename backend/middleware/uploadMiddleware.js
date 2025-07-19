/**
 * Middleware for handling file upload errors and validation
 */

const multer = require('multer');

// Error handler for multer upload errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    error: 'File size too large. Maximum size allowed is 10MB.',
                    code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    error: 'Too many files. Please upload only one file.',
                    code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    error: 'Unexpected file field. Please use the correct field name.',
                    code: 'UNEXPECTED_FIELD'
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: 'File upload error. Please try again.',
                    code: 'UPLOAD_ERROR'
                });
        }
    }

    if (error.message === 'Only Excel files (.xlsx, .xls) are allowed') {
        return res.status(400).json({
            success: false,
            error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls).',
            code: 'INVALID_FILE_TYPE'
        });
    }

    // For other errors, pass to next middleware
    next(error);
};

// Validate file after upload
const validateUploadedFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded. Please select an Excel file.',
            code: 'NO_FILE'
        });
    }

    // Additional file validation can be added here
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls).',
            code: 'INVALID_MIME_TYPE'
        });
    }

    // Check if file is not empty
    if (req.file.size === 0) {
        return res.status(400).json({
            success: false,
            error: 'Empty file uploaded. Please upload a file with data.',
            code: 'EMPTY_FILE'
        });
    }

    next();
};

// Rate limiting for bulk uploads (optional)
const createUploadRateLimit = () => {
    const rateLimit = require('express-rate-limit');
    
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 upload requests per windowMs
        message: {
            success: false,
            error: 'Too many upload attempts. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            // Skip rate limiting for template downloads
            return req.path.includes('/template');
        }
    });
};

module.exports = {
    handleUploadError,
    validateUploadedFile,
    createUploadRateLimit
};
