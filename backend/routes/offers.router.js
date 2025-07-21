const express = require('express');
const { OffersModel, client } = require('../models/offers.model.pg.js');
const { authenticateToken } = require('../middleware/auth.js');
const { entityModel } = require('../models/entity.model.pg.js');
const emailService = require('../services/emailService.js');
const multer = require('multer');
const bulkOfferService = require('../services/bulkOfferService.js');
const bulkOfferRequestService = require('../services/bulkOfferRequestService.js');
const { validateUploadedFile, createUploadRateLimit } = require('../middleware/uploadMiddleware.js');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
        }
    }
});

// Create rate limiter for uploads
const uploadRateLimit = createUploadRateLimit();

const router = express.Router();

// Validation middleware for offers
const validateOfferData = (req, res, next) => {
    const { title, category, description, target_geo, payout_type, payout_value, landing_page_url } = req.body;

    const errors = [];

    if (!title || title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
    }

    if (!category || category.trim().length === 0) {
        errors.push('Category is required');
    }

    if (description && description.trim().length > 0 && description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long if provided');
    }

    if (!target_geo || !Array.isArray(target_geo) || target_geo.length === 0) {
        errors.push('Target geo must be a non-empty array');
    }

    if (!payout_type || !['CPA', 'CPL', 'CPI', 'RevShare'].includes(payout_type)) {
        errors.push('Payout type must be one of: CPA, CPL, CPI, RevShare');
    }

    if (!payout_value || isNaN(payout_value) || parseFloat(payout_value) <= 0) {
        errors.push('Payout value must be a positive number');
    }

    if (!landing_page_url || !isValidUrl(landing_page_url)) {
        errors.push('Valid landing page URL is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

// Validation middleware for offer requests
const validateOfferRequestData = (req, res, next) => {
    const { title, vertical, geos_targeting, traffic_type, traffic_volume, platforms_used } = req.body;

    const errors = [];

    if (!title || title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
    }

    if (!vertical || vertical.trim().length === 0) {
        errors.push('Vertical is required');
    }

    if (!geos_targeting || !Array.isArray(geos_targeting) || geos_targeting.length === 0) {
        errors.push('Geos targeting must be a non-empty array');
    }

    if (!traffic_type || !Array.isArray(traffic_type) || traffic_type.length === 0) {
        errors.push('Traffic type must be a non-empty array');
    }

    if (!traffic_volume || isNaN(traffic_volume) || parseInt(traffic_volume) <= 0) {
        errors.push('Traffic volume must be a positive number');
    }

    if (!platforms_used || !Array.isArray(platforms_used) || platforms_used.length === 0) {
        errors.push('Platforms used must be a non-empty array');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

// Helper function to validate URLs
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuthentication = (req, res, next) => {
    // Check if Authorization header exists
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token provided, continue without user
        req.user = null;
        return next();
    }

    // Token provided, verify it
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Invalid token, continue without user (don't fail the request)
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

// Middleware to check entity permissions for offer requests
const checkOfferRequestPermissions = async (req, res, next) => {
    try {
        const { entity_id } = req.body;
        const user_id = req.user.user_id;

        if (entity_id) {
            // Get entity details
            const entity = await entityModel.getEntityById(entity_id);
            if (!entity) {
                return res.status(404).json({
                    success: false,
                    error: 'Entity not found'
                });
            }

            // Check if entity type can create offer requests (affiliates and networks)
            if (!['affiliate', 'network'].includes(entity.entity_type)) {
                return res.status(403).json({
                    success: false,
                    error: 'Only affiliates and networks can create offer requests'
                });
            }

            // Check if entity is approved
            if (entity.verification_status !== 'approved') {
                return res.status(403).json({
                    success: false,
                    error: 'Entity must be approved to create offer requests'
                });
            }

            req.entity = entity;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// PUBLIC ROUTES

// Get all active offers (public)
router.get('/fetch_all', optionalAuthentication, async (req, res) => {
    try {
        const { category, payout_type, entity_type, min_payout, max_payout, search, geo, limit = 20, offset = 0 } = req.query;
        const filters = {};
        if (category) filters.category = category;
        if (payout_type) filters.payout_type = payout_type;
        if (entity_type) filters.entity_type = entity_type;
        if (min_payout) filters.min_payout = parseFloat(min_payout);
        if (max_payout) filters.max_payout = parseFloat(max_payout);
        if (search) filters.search = search;
        if (geo) filters.geo = geo;

        // If user is authenticated, exclude their entity's offers
        if (req.user && req.user.email) {
            filters.exclude_entity = req.user.email; // Exclude offers from the user's entity
        }

        const result = await OffersModel.getOffers(filters, parseInt(limit), parseInt(offset));

        if (result.success) {
            res.json({
                success: true,
                offers: result.offers,
                total: result.total,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: result.total,
                    count: result.offers.length
                }
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get all active offer requests (protected)
router.get('/offer-requests', authenticateToken, async (req, res) => {
    try {
        const {
            vertical,
            desired_payout_type,
            entity_type,
            exclude_entity_id,
            search,
            limit = 20,
            offset = 0
        } = req.query;

        const user_id = req.user.user_id;
        const filters = {};
        if (vertical) filters.vertical = vertical;
        if (desired_payout_type) filters.desired_payout_type = desired_payout_type;
        if (entity_type) filters.entity_type = entity_type;
        if (exclude_entity_id) filters.exclude_entity_id = exclude_entity_id;
        if (search) filters.search = search;

        const result = await OffersModel.getOfferRequests(user_id, filters, parseInt(limit), parseInt(offset));

        if (result.success) {
            res.json({
                success: true,
                requests: result.requests,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: result.requests.length
                }
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get specific offer details (public)
router.get('/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const result = await OffersModel.getOfferById(offer_id);

        if (result.success) {
            res.json({
                success: true,
                offer: result.offer
            });
        } else {
            res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PROTECTED ROUTES (require authentication)

// Create new offer (advertisers and networks only)
router.post('/create', authenticateToken, validateOfferData, async (req, res) => {
    try {
        const offerData = {
            ...req.body,
            user_id: req.user.user_id
        };

        const result = await OffersModel.createOffer(offerData);

        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Offer created successfully',
                offer: result.offer
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Create new offer request (affiliates and networks only)
router.post('/offer-request', authenticateToken, validateOfferRequestData, checkOfferRequestPermissions, async (req, res) => {
    try {
        const requestData = {
            ...req.body,
            user_id: req.user.user_id
        };

        const result = await OffersModel.createOfferRequest(requestData);

        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Offer request created successfully',
                request: result.request
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get offers by entity (public)
router.get('/entity/public/:entity_id', async (req, res) => {
    try {
        const { entity_id } = req.params;
        const {
            category,
            search,
            limit = 20,
            offset = 0
        } = req.query;

        const filters = {
            entity_id,
            status: 'active' // Only show active offers for public view
        };
        if (category) filters.category = category;
        if (search) filters.search = search;

        const result = await OffersModel.getOffersByEntity(entity_id, filters, parseInt(limit), parseInt(offset));

        if (result.success) {
            res.json({
                success: true,
                offers: result.offers,
                total: result.total,
                pagination: result.pagination
            });
        } else {
            res.status(404).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get offers by entity (protected)
router.get('/entity/:entity_id', authenticateToken, async (req, res) => {
    try {
        const { entity_id } = req.params;
        const { offer_status, category, search, limit = 20, offset = 0 } = req.query;

        const filters = { entity_id };
        if (offer_status) filters.status = offer_status;
        if (category) filters.category = category;
        if (search) filters.search = search;

        const result = await OffersModel.getOffersByEntity(entity_id, filters, parseInt(limit), parseInt(offset));

        if (result.success) {
            res.json({
                success: true,
                offers: result.offers,
                total: result.total,
                pagination: result.pagination
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get offer requests by user (protected)
router.get('/offer-requests/user/:user_id', authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.params;
        const {
            status,
            vertical,
            search,
            limit = 20,
            offset = 0
        } = req.query;

        // Check if user is requesting their own data or is admin
        if (req.user.user_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only view your own offer requests.'
            });
        }

        const filters = { user_id };
        if (status) filters.status = status;
        if (vertical) filters.vertical = vertical;
        if (search) filters.search = search;

        const result = await OffersModel.getOfferRequestsByUser(user_id, filters, parseInt(limit), parseInt(offset));

        if (result.success) {
            res.json({
                success: true,
                requests: result.requests,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: result.requests.length
                }
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Send contact email to affiliate
router.post('/offer-requests/:offer_request_id/contact', authenticateToken, async (req, res) => {
    try {
        const { offer_request_id } = req.params;
        const { message } = req.body;
        const sender_user_id = req.user.user_id;

        // Get the offer request details
        const offerRequestQuery = `
            SELECT req.*, e.name as entity_name, u.email as recipient_email,
                   CONCAT(u.first_name, ' ', u.last_name) as recipient_name
            FROM offer_requests req
            LEFT JOIN entities e ON req.entity_id = e.entity_id
            LEFT JOIN users u ON req.user_id = u.user_id
            WHERE req.offer_request_id = $1 AND req.request_status = 'active'
        `;

        const offerRequestResult = await client.query(offerRequestQuery, [offer_request_id]);

        if (offerRequestResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Offer request not found or no longer active'
            });
        }

        const offerRequest = offerRequestResult.rows[0];

        // Get sender details
        const senderQuery = `
            SELECT u.*, e.name as entity_name
            FROM users u
            LEFT JOIN entities e ON u.entity_id = e.entity_id
            WHERE u.user_id = $1
        `;

        const senderResult = await client.query(senderQuery, [sender_user_id]);

        if (senderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sender not found'
            });
        }

        const sender = senderResult.rows[0];

        // Prepare email data
        const contactData = {
            senderName: `${sender.first_name} ${sender.last_name}`,
            senderEmail: sender.email,
            senderCompany: sender.entity_name || 'Independent',
            recipientName: offerRequest.recipient_name,
            recipientEmail: offerRequest.recipient_email,
            offerRequestTitle: offerRequest.title,
            messageContent: message,
            offerRequestDetails: {
                vertical: offerRequest.vertical,
                traffic_volume: offerRequest.traffic_volume,
                desired_payout_type: offerRequest.desired_payout_type,
                geos_targeting: offerRequest.geos_targeting
            }
        };

        // Send the email
        const emailResult = await emailService.sendAffiliateContactEmail(contactData);

        if (emailResult.success) {
            // Track the email in the database
            const emailTrackingData = {
                sender_user_id: sender_user_id,
                sender_entity_id: sender.entity_id,
                recipient_user_id: offerRequest.user_id,
                recipient_entity_id: offerRequest.entity_id,
                offer_request_id: offer_request_id,
                email_type: 'contact_request',
                recipient_email: offerRequest.recipient_email,
                subject: `New Contact Request for "${offerRequest.title}" - AdBond`,
                message_content: message,
                metadata: {
                    sender_company: contactData.senderCompany,
                    offer_request_title: offerRequest.title,
                    contact_method: 'platform_email'
                }
            };

            res.json({
                success: true,
                message: 'Contact email sent successfully',
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send contact email'
            });
        }

    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get email history for user
router.get('/email-history', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0, type = 'all' } = req.query;
        const user_id = req.user.user_id;

        const filters = {};

        if (type === 'sent') {
            filters.sender_user_id = user_id;
        } else if (type === 'received') {
            filters.recipient_user_id = user_id;
        } else {
            // For 'all', we need a custom query
        }

        let result;
        if (type === 'all') {
            // Custom query for both sent and received emails
            const query = `
                SELECT et.*, 
                       CONCAT(su.first_name, ' ', su.last_name) as sender_name,
                       CONCAT(ru.first_name, ' ', ru.last_name) as recipient_name,
                       se.name as sender_entity_name,
                       re.name as recipient_entity_name,
                       req.title as offer_request_title,
                       CASE 
                           WHEN et.sender_user_id = $1 THEN 'sent'
                           WHEN et.recipient_user_id = $1 THEN 'received'
                       END as direction
                FROM email_tracking et
                LEFT JOIN users su ON et.sender_user_id = su.user_id
                LEFT JOIN users ru ON et.recipient_user_id = ru.user_id
                LEFT JOIN entities se ON et.sender_entity_id = se.entity_id
                LEFT JOIN entities re ON et.recipient_entity_id = re.entity_id
                LEFT JOIN offer_requests req ON et.offer_request_id = req.offer_request_id
                WHERE et.sender_user_id = $1 OR et.recipient_user_id = $1
                ORDER BY et.sent_at DESC
                LIMIT $2 OFFSET $3
            `;

            const queryResult = await client.query(query, [user_id, parseInt(limit), parseInt(offset)]);
            result = { success: true, emails: queryResult.rows };
        } else {
            result = await OffersModel.getEmailHistory(filters, parseInt(limit), parseInt(offset));
        }

        if (result.success) {
            res.json({
                success: true,
                emails: result.emails,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: result.emails.length
                }
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error fetching email history:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Update existing offer (advertisers and networks only)
router.put('/:offer_id', authenticateToken, async (req, res) => {
    try {
        const { offer_id } = req.params;
        const entity_id = req.body.entity_id;
        console.log('Updating offer:', offer_id, 'for entity:', entity_id);

        // Validate that the user can update this offer
        const existingOffer = await OffersModel.getOfferById(offer_id);
        if (!existingOffer.success) {
            return res.status(404).json({ success: false, error: 'Offer not found' });
        }

        if (existingOffer.offer.entity_id !== entity_id) {
            return res.status(403).json({ success: false, error: 'You do not have permission to update this offer' });
        }

        const result = await OffersModel.updateOffer(offer_id, req.body, entity_id);

        if (result.success) {
            res.json({
                success: true,
                message: 'Offer updated successfully',
                offer: result.offer
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Update offer error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Update existing offer request (affiliates and networks only)
router.put('/offer-requests/:offer_request_id', authenticateToken, async (req, res) => {
    try {
        const { offer_request_id } = req.params;
        const user_id = req.user.user_id;

        // Validate that the user can update this offer request
        const query = 'SELECT * FROM offer_requests WHERE offer_request_id = $1';
        const existingRequest = await require('../models/offers.model.pg.js').client.query(query, [offer_request_id]);

        if (existingRequest.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Offer request not found' });
        }

        if (existingRequest.rows[0].user_id !== user_id) {
            return res.status(403).json({ success: false, error: 'You do not have permission to update this offer request' });
        }

        const result = await OffersModel.updateOfferRequest(offer_request_id, req.body, user_id);

        if (result.success) {
            res.json({
                success: true,
                message: 'Offer request updated successfully',
                request: result.request
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Update offer request error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Bulk upload offers (advertisers and networks only)
// Download Excel template for bulk offer upload
router.get('/bulk-upload/template', authenticateToken, async (req, res) => {
    try {
        const path = require('path');
        const fs = require('fs');

        // Path to the static template file
        const templatePath = path.join(__dirname, '..', 'assets', 'templates', 'bulk_offers_template.xlsx');

        // Check if template file exists
        if (!fs.existsSync(templatePath)) {
            console.error('Template file not found at:', templatePath);
            return res.status(404).json({ success: false, error: 'Template file not found' });
        }

        // Get file stats for content length
        const stats = fs.statSync(templatePath);

        console.log('Serving Excel template from:', templatePath);
        console.log('File size:', stats.size, 'bytes');

        // Set headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="bulk_offers_template.xlsx"');
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send the file
        res.sendFile(templatePath, (err) => {
            if (err) {
                console.error('Error sending template file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, error: 'Failed to download template' });
                }
            } else {
                console.log('Template sent successfully');
            }
        });
    } catch (error) {
        console.error('Template download error:', error);
        res.status(500).json({ success: false, error: 'Failed to download template' });
    }
});

// Preview Excel file before upload (validate and show preview)
router.post('/bulk-upload/preview', authenticateToken, uploadRateLimit, upload.single('file'), validateUploadedFile, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file provided' });
        }

        const { email } = req.user;

        // Get entity using email to ensure we have the correct entity_id
        const entity = await entityModel.getEntityByEmail(email);
        if (!entity) {
            return res.status(404).json({
                success: false,
                error: 'Entity not found for user'
            });
        }

        const results = await bulkOfferService.processExcelFile(req.file.buffer, entity.entity_id);

        // Return preview without saving to database
        res.json({
            success: true,
            message: 'File processed successfully',
            preview: {
                total: results.total,
                valid: results.successful,
                invalid: results.failed,
                errors: results.errors,
                sampleOffers: results.processedOffers.slice(0, 5) // Show first 5 valid offers as preview
            }
        });
    } catch (error) {
        console.error('File preview error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Upload and save offers from Excel file
router.post('/bulk-upload', authenticateToken, uploadRateLimit, upload.single('file'), validateUploadedFile, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file provided' });
        }

        const { user_id, email } = req.user;

        // Get entity using email to ensure we have the correct entity_id
        const entity = await entityModel.getEntityByEmail(email);
        if (!entity) {
            console.error('Entity not found for user email:', email);
            return res.status(404).json({
                success: false,
                error: 'Entity not found for user'
            });
        }

        console.log('Processing bulk upload for entity:', entity.entity_id, 'Entity name:', entity.name);

        // Process the Excel file
        const processResults = await bulkOfferService.processExcelFile(req.file.buffer, entity.entity_id);
        console.log('File processing results:', {
            total: processResults.total,
            successful: processResults.successful,
            failed: processResults.failed,
            offersCount: processResults.processedOffers.length
        });

        if (processResults.processedOffers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid offers found in the file',
                details: processResults.errors
            });
        }

        // Ensure all offers are mapped to the correct entity_id
        const mappedOffers = processResults.processedOffers.map(offer => ({
            ...offer,
            entity_id: entity.entity_id // Override with correct entity_id
        }));

        console.log('Mapped offers count:', mappedOffers.length, 'Sample offer entity_id:', mappedOffers[0]?.entity_id);

        // Save valid offers to database using OffersModel
        const saveResults = await OffersModel.bulkCreateOffers(mappedOffers, user_id);
        console.log('Database save results:', saveResults.success ? 'Success' : 'Failed', saveResults.summary || saveResults.error);

        res.json({
            success: true,
            message: 'Bulk upload completed',
            results: {
                fileProcessing: {
                    total: processResults.total,
                    validOffers: processResults.successful,
                    invalidOffers: processResults.failed,
                    processingErrors: processResults.errors
                },
                databaseSave: saveResults.success ? saveResults.summary : {
                    successful: 0,
                    failed: processResults.processedOffers.length,
                    saveErrors: [saveResults.error]
                }
            }
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get bulk upload history (optional feature)
router.get('/bulk-upload/history', authenticateToken, async (req, res) => {
    try {
        const { email } = req.user;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        // Get entity using email to ensure we have the correct entity_id
        const entity = await entityModel.getEntityByEmail(email);
        if (!entity) {
            return res.status(404).json({
                success: false,
                error: 'Entity not found for user'
            });
        }

        // Get recent offers created by this entity (as a proxy for upload history)
        const query = `
            SELECT offer_id, title, category, payout_type, payout_value, 
                   offer_status, created_at
            FROM offers 
            WHERE entity_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;

        const result = await client.query(query, [entity.entity_id, limit, offset]);

        res.json({
            success: true,
            offers: result.rows,
            pagination: {
                limit,
                offset,
                total: result.rows.length
            }
        });
    } catch (error) {
        console.error('Bulk upload history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch upload history' });
    }
});

// BULK OFFER REQUEST UPLOAD ROUTES

// Download Excel template for bulk offer request upload
router.get('/bulk-offer-request-upload/template', authenticateToken, async (req, res) => {
    try {
        const template = bulkOfferRequestService.createTemplate();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="bulk_offer_requests_template.xlsx"');
        res.send(template);
    } catch (error) {
        console.error('Template creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create template',
            code: 'TEMPLATE_ERROR'
        });
    }
});

// Preview Excel file for bulk offer request upload
router.post('/bulk-offer-request-upload/preview', authenticateToken, uploadRateLimit, upload.single('file'), validateUploadedFile, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                code: 'NO_FILE'
            });
        }

        const previewResults = await bulkOfferRequestService.previewExcelFile(req.file.buffer);

        res.json({
            success: true,
            preview: previewResults
        });
    } catch (error) {
        console.error('Preview error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
            code: 'PREVIEW_ERROR'
        });
    }
});

// Bulk upload offer requests
router.post('/bulk-offer-request-upload', authenticateToken, uploadRateLimit, upload.single('file'), validateUploadedFile, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                code: 'NO_FILE'
            });
        }

        const userId = req.user.user_id;
        const { email } = req.user;

        const entity = await entityModel.getEntityByEmail(email);

        if (!entity) {
            return res.status(404).json({
                success: false,
                error: 'Entity not found for user'
            });
        }

        if (!['affiliate', 'network'].includes(entity.entity_type)) {
            return res.status(403).json({
                success: false,
                error: 'Only affiliates and networks can create offer requests'
            });
        }

        if (entity.verification_status !== 'approved') {
            return res.status(403).json({
                success: false,
                error: 'Entity must be approved to create offer requests'
            });
        }

        // Process the Excel file
        const fileProcessing = await bulkOfferRequestService.processExcelFile(req.file.buffer, userId, entity.entity_id);

        if (fileProcessing.successful === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid offer requests found in the file',
                details: fileProcessing.errors
            });
        }

        // Save to database
        const databaseSave = await bulkOfferRequestService.saveRequestsToDatabase(fileProcessing.processedRequests);

        res.json({
            success: true,
            message: `Successfully processed ${databaseSave.successful} offer requests`,
            results: {
                fileProcessing: {
                    total: fileProcessing.total,
                    successful: fileProcessing.successful,
                    failed: fileProcessing.failed,
                    errors: fileProcessing.errors
                },
                databaseSave
            }
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: 'UPLOAD_ERROR'
        });
    }
});

// Get bulk offer request upload history
router.get('/bulk-offer-request-upload/history', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const userId = req.user.user_id;

        // Get bulk uploaded offer requests for the current user
        const result = await OffersModel.getOfferRequestsByUser(userId, {}, parseInt(limit), parseInt(offset));

        if (result.success) {
            res.json({
                success: true,
                requests: result.requests,
                total: result.total,
                pagination: result.pagination
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upload history'
        });
    }
});

// Error handling middleware for file uploads
router.use((error, req, res, next) => {
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
});

module.exports = router;
