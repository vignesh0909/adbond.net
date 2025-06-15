const express = require('express');
const { OffersModel } = require('../models/offers.model.pg.js');
const { authenticateToken } = require('../middleware/auth.js');
const { validateEntity } = require('../middleware/validation.js');
const { entityModel } = require('../models/entity.model.pg.js');

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
    
    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
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

// Middleware to check entity permissions for offers
const checkOfferPermissions = async (req, res, next) => {
    try {
        const { entity_id } = req.body;
        const user_id = req.user.user_id;
        
        // Get entity details
        const entity = await entityModel.getEntityById(entity_id);
        if (!entity) {
            return res.status(404).json({ 
                success: false, 
                error: 'Entity not found' 
            });
        }
        
        // Check if user owns the entity (entities don't have user_id, so we'll allow any authenticated user for now)
        // TODO: Implement proper entity ownership checking
        
        // Check if entity type can create offers (advertisers and networks)
        if (!['advertiser', 'network'].includes(entity.entity_type)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only advertisers and networks can create offers' 
            });
        }
        
        // Check if entity is approved
        if (entity.verification_status !== 'approved') {
            return res.status(403).json({ 
                success: false, 
                error: 'Entity must be approved to create offers' 
            });
        }
        
        req.entity = entity;
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
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
            
            // Check if user owns the entity (entities don't have user_id, so we'll allow any authenticated user for now)
            // TODO: Implement proper entity ownership checking
            
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
router.get('/fetch_all', async (req, res) => {
    try {
        const {
            category,
            payout_type,
            entity_type,
            min_payout,
            max_payout,
            limit = 20,
            offset = 0
        } = req.query;

        console.log(req.user)

        const filters = {};
        if (category) filters.category = category;
        if (payout_type) filters.payout_type = payout_type;
        if (entity_type) filters.entity_type = entity_type;
        if (min_payout) filters.min_payout = parseFloat(min_payout);
        if (max_payout) filters.max_payout = parseFloat(max_payout);

        const result = await OffersModel.getOffers(filters, parseInt(limit), parseInt(offset));
        
        if (result.success) {
            res.json({
                success: true,
                offers: result.offers,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
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
            limit = 20,
            offset = 0
        } = req.query;

        const filters = {};
        if (vertical) filters.vertical = vertical;
        if (desired_payout_type) filters.desired_payout_type = desired_payout_type;
        if (entity_type) filters.entity_type = entity_type;
        if (exclude_entity_id) filters.exclude_entity_id = exclude_entity_id;

        const result = await OffersModel.getOfferRequests(filters, parseInt(limit), parseInt(offset));
        
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

// Track offer click (public)
router.post('/:offer_id/click', async (req, res) => {
    try {
        const { offer_id } = req.params;
        const { entity_id } = req.body;
        
        // Get IP address and user agent from request
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('User-Agent');
        const referrer_url = req.get('Referer');
        
        const clickData = {
            offer_id,
            clicker_entity_id: entity_id || null,
            user_id: req.user ? req.user.user_id : null,
            ip_address,
            user_agent,
            referrer_url
        };
        
        const result = await OffersModel.trackOfferClick(clickData);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Click tracked successfully',
                click_id: result.click.click_id
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PROTECTED ROUTES (require authentication)

// Create new offer (advertisers and networks only)
router.post('/create', authenticateToken, validateOfferData, checkOfferPermissions, async (req, res) => {
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

// Create bid for offer request
router.post('/offer-requests/:offer_request_id/bid', authenticateToken, async (req, res) => {
    try {
        const { offer_request_id } = req.params;
        const { entity_id, bid_amount, bid_notes, offer_details } = req.body;
        
        // Validation
        if (!entity_id || !bid_amount || isNaN(bid_amount) || parseFloat(bid_amount) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Entity ID and valid bid amount are required'
            });
        }
        
        // Check entity ownership and permissions
        const entity = await entityModel.getEntityById(entity_id);
        if (!entity) {
            return res.status(404).json({ 
                success: false, 
                error: 'Entity not found' 
            });
        }
        
        // Check if user owns the entity (entities don't have user_id, so we'll allow any authenticated user for now)
        // TODO: Implement proper entity ownership checking
        
        if (!['advertiser', 'network'].includes(entity.entity_type)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only advertisers and networks can bid on offer requests' 
            });
        }
        
        if (entity.verification_status !== 'approved') {
            return res.status(403).json({ 
                success: false, 
                error: 'Entity must be approved to bid on offer requests' 
            });
        }
        
        const bidData = {
            offer_request_id,
            entity_id,
            user_id: req.user.user_id,
            bid_amount: parseFloat(bid_amount),
            bid_notes,
            offer_details
        };
        
        const result = await OffersModel.createBid(bidData);
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Bid created successfully',
                bid: result.bid
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get bids for an offer request
router.get('/offer-requests/:offer_request_id/bids', authenticateToken, async (req, res) => {
    try {
        const { offer_request_id } = req.params;
        
        const result = await OffersModel.getBidsForRequest(offer_request_id);
        
        if (result.success) {
            res.json({
                success: true,
                bids: result.bids
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
            limit = 20,
            offset = 0
        } = req.query;

        const filters = { 
            entity_id,
            status: 'active' // Only show active offers for public view
        };
        if (category) filters.category = category;

        const result = await OffersModel.getOffersByEntity(entity_id, filters, parseInt(limit), parseInt(offset));
        
        if (result.success) {
            res.json({
                success: true,
                offers: result.offers,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: result.offers.length
                }
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
        const {
            status,
            category,
            limit = 20,
            offset = 0
        } = req.query;

        const filters = { entity_id };
        if (status) filters.status = status;
        if (category) filters.category = category;

        const result = await OffersModel.getOffersByEntity(entity_id, filters, parseInt(limit), parseInt(offset));
        
        if (result.success) {
            res.json({
                success: true,
                offers: result.offers,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
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

// Get offer requests by user (protected)
router.get('/offer-requests/user/:user_id', authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.params;
        const {
            status,
            vertical,
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

module.exports = router;
