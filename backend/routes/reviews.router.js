const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { entityModel } = require('../models/entity.model.pg');
const { userModel } = require('../models/user.model.pg');
const client = require('../models/db_connection.js').pool;

// Validation middleware for reviews
const validateReviewData = (req, res, next) => {
    const { entity_id, overall_rating, title, review_text, category_ratings } = req.body;
    const errors = [];

    if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
        errors.push('Overall rating must be between 1 and 5');
    }

    if (!title || title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
    }

    if (!review_text || review_text.trim().length < 10) {
        errors.push('Review text must be at least 10 characters long');
    }

    if (!category_ratings || typeof category_ratings !== 'object') {
        errors.push('Category ratings are required');
    } else {
        const requiredCategories = ['quality', 'support', 'reliability', 'payment_speed'];
        for (const category of requiredCategories) {
            if (!category_ratings[category] || category_ratings[category] < 1 || category_ratings[category] > 5) {
                errors.push(`${category} rating must be between 1 and 5`);
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

// PUBLIC ROUTES

// Get approved reviews for an entity (public)
router.get('/entity/:entity_id', async (req, res) => {
    try {
        const { entity_id } = req.params;
        const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;

        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                r.review_id, r.title, r.overall_rating, r.review_text, r.category_ratings, r.tags, r.is_anonymous, r.is_verified,
                r.helpful_votes, r.unhelpful_votes, r.created_at,
                CASE 
                    WHEN r.is_anonymous = true THEN 'Anonymous'
                    ELSE CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))
                END as reviewer_name,
                r.reviewer_type,
                COUNT(rr.reply_id) as reply_count
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN review_replies rr ON r.review_id = rr.review_id
            WHERE r.entity_id = $1 AND r.review_status = 'approved'
            GROUP BY r.review_id, u.first_name, u.last_name
            ORDER BY ${sort} ${order.toUpperCase()}
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM reviews
            WHERE entity_id = $1 AND review_status = 'approved'
        `;

        const [reviewsResult, countResult] = await Promise.all([
            client.query(query, [entity_id, limit, offset]),
            client.query(countQuery, [entity_id])
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            reviews: reviewsResult.rows,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_reviews: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get review replies (public)
router.get('/:review_id/replies', async (req, res) => {
    try {
        const { review_id } = req.params;

        const query = `
            SELECT rr.reply_id, rr.reply_text, rr.reply_type, rr.is_official,rr.created_at, CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as replier_name,
                u.role as replier_role
            FROM review_replies rr
            JOIN users u ON rr.user_id = u.user_id
            WHERE rr.review_id = $1
            ORDER BY rr.created_at ASC
        `;

        const result = await client.query(query, [review_id]);

        res.json({
            success: true,
            replies: result.rows
        });
    } catch (error) {
        console.error('Get review replies error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PROTECTED ROUTES

// Submit a new review
router.post('/', authenticateToken, validateReviewData, async (req, res) => {
    try {
        const { entity_id, entity_name, title, overall_rating, review_text, category_ratings, proof_attachments = [], tags = [], is_anonymous = false } = req.body;

        const review_id = uuidv4();
        const user_id = req.user.user_id;

        // Get user's role/type
        const user = await userModel.getUserById(user_id);
        const reviewer_type = user.role;

        // Check entity status and determine review workflow
        let target_entity_id = entity_id;
        let review_status = 'pending'; // Default to pending (admin review required)
        let message = 'Review submitted for moderation';

        if (!entity_id && entity_name) {
            // Handle unregistered entity review - use the new table
            const unregReviewData = {
                review_id,
                entity_name,
                entity_website: req.body.entity_website || '',
                entity_description: req.body.entity_description || '',
                entity_contact_info: req.body.entity_contact_info || {},
                user_id,
                reviewer_type,
                title,
                overall_rating,
                review_text,
                category_ratings,
                proof_attachments,
                tags,
                is_anonymous
            };

            const unregReview = await entityModel.createUnregisteredEntityReview(unregReviewData);
            
            return res.status(201).json({
                success: true,
                message: 'Review submitted successfully. It will be reviewed by our admin team.',
                review: unregReview,
                is_unregistered_entity: true
            });
        } else if (entity_id) {
            // Check if entity is registered and approved
            const entityCheckQuery = `
                SELECT verification_status, name 
                FROM entities 
                WHERE entity_id = $1
            `;
            const entityResult = await client.query(entityCheckQuery, [entity_id]);

            if (entityResult.rows.length > 0) {
                const entity = entityResult.rows[0];
                if (entity.verification_status === 'approved') {
                    // Auto-approve review for registered/approved entities
                    review_status = 'approved';
                    message = 'Review published successfully!';
                } else {
                    // Entity exists but not approved yet
                    review_status = 'pending';
                    message = 'Review submitted for moderation. This entity is pending verification, so your review will be reviewed by our admin team.';
                }
            } else {
                // Entity ID provided but doesn't exist - shouldn't happen with proper frontend validation
                review_status = 'pending';
                message = 'Review submitted for moderation';
            }

            // Insert review with determined status (only for registered entities)
            const insertQuery = `
                INSERT INTO reviews (
                    review_id, entity_id, user_id, reviewer_type, title, overall_rating,
                    review_text, category_ratings, proof_attachments, tags, is_anonymous,
                    review_status, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
                )
                RETURNING *
            `;

            const values = [
                review_id, entity_id, user_id, reviewer_type, title, overall_rating,
                review_text, JSON.stringify(category_ratings), JSON.stringify(proof_attachments),
                JSON.stringify(tags), is_anonymous, review_status
            ];

            const result = await client.query(insertQuery, values);

            // If review was auto-approved, update entity reputation
            if (review_status === 'approved') {
                await updateEntityReputation(entity_id);
            }

            res.status(201).json({
                success: true,
                message: message,
                review: result.rows[0],
                auto_approved: review_status === 'approved'
            });
        } else {
            // Neither entity_id nor entity_name provided
            return res.status(400).json({
                success: false,
                error: 'Either entity_id or entity_name must be provided'
            });
        }
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Reply to a review
router.post('/:review_id/reply', authenticateToken, async (req, res) => {
    try {
        const { review_id } = req.params;
        const { reply_text, reply_type = 'response' } = req.body;
        const user_id = req.user.user_id;

        if (!reply_text || reply_text.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Reply text must be at least 3 characters long'
            });
        }

        const validReplyTypes = ['response', 'dispute', 'clarification'];
        if (!validReplyTypes.includes(reply_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reply type'
            });
        }

        // Check if review exists and is approved
        const reviewQuery = 'SELECT * FROM reviews WHERE review_id = $1';
        const reviewResult = await client.query(reviewQuery, [review_id]);

        if (reviewResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        const review = reviewResult.rows[0];

        // Determine if this is an official reply (entity owner or admin)
        const user = await userModel.getUserById(user_id);
        const isOfficial = user.role === 'admin' || user.entity_id === review.entity_id;

        const reply_id = uuidv4();
        const insertReplyQuery = `
            INSERT INTO review_replies (
                reply_id, review_id, user_id, reply_text, reply_type, is_official, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const replyResult = await client.query(insertReplyQuery, [
            reply_id, review_id, user_id, reply_text, reply_type, isOfficial
        ]);

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            reply: replyResult.rows[0]
        });
    } catch (error) {
        console.error('Reply to review error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Vote on review helpfulness
router.post('/:review_id/vote', authenticateToken, async (req, res) => {
    try {
        const { review_id } = req.params;
        const { vote_type } = req.body; // 'helpful' or 'unhelpful'

        if (!['helpful', 'unhelpful'].includes(vote_type)) {
            return res.status(400).json({
                success: false,
                error: 'Vote type must be "helpful" or "unhelpful"'
            });
        }

        const column = vote_type === 'helpful' ? 'helpful_votes' : 'unhelpful_votes';

        const updateQuery = `
            UPDATE reviews 
            SET ${column} = ${column} + 1, updated_at = NOW()
            WHERE review_id = $1 AND review_status = 'approved'
            RETURNING helpful_votes, unhelpful_votes
        `;

        const result = await client.query(updateQuery, [review_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Review not found or not approved'
            });
        }

        res.json({
            success: true,
            message: 'Vote recorded',
            votes: result.rows[0]
        });
    } catch (error) {
        console.error('Vote on review error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get user's own reviews
router.get('/my-reviews', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let statusFilter = '';
        let queryParams = [user_id, limit, offset];

        if (status) {
            statusFilter = 'AND r.review_status = $4';
            queryParams.push(status);
        }

        const query = `
            SELECT r.review_id, r.title, r.overall_rating, r.review_text, r.category_ratings, r.review_status,
                r.admin_notes, r.created_at, r.updated_at, e.name as entity_name, COUNT(rr.reply_id) as reply_count
            FROM reviews r
            JOIN entities e ON r.entity_id = e.entity_id
            LEFT JOIN review_replies rr ON r.review_id = rr.review_id
            WHERE r.user_id = $1 ${statusFilter}
            GROUP BY r.review_id, e.name
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await client.query(query, queryParams);

        res.json({
            success: true,
            reviews: result.rows
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get reviews for entity owner (for entity dashboard)
router.get('/entity/:entity_id/dashboard', authenticateToken, async (req, res) => {
    try {
        const { entity_id } = req.params;
        const { page = 1, limit = 10, status = 'approved' } = req.query;
        const offset = (page - 1) * limit;

        // Verify user owns this entity or is admin
        const user = await userModel.getUserById(req.user.user_id);
        if (user.entity_id !== entity_id && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const query = `
            SELECT r.review_id, r.title, r.overall_rating, r.review_text, r.category_ratings, r.review_status, r.is_anonymous,
                r.helpful_votes, r.unhelpful_votes, r.created_at,
                CASE 
                    WHEN r.is_anonymous = true THEN 'Anonymous'
                    ELSE CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))
                END as reviewer_name,
                r.reviewer_type,
                COUNT(rr.reply_id) as reply_count,
                MAX(CASE WHEN rr.user_id = $3 THEN rr.reply_id END) as has_owner_reply
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN review_replies rr ON r.review_id = rr.review_id
            WHERE r.entity_id = $1 AND r.review_status = $4
            GROUP BY r.review_id, u.first_name, u.last_name
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $5
        `;

        const result = await client.query(query, [entity_id, limit, req.user.user_id, status, offset]);

        // Get statistics
        const statsQuery = `
            SELECT 
                AVG(overall_rating) as avg_rating,
                COUNT(*) as total_reviews,
                COUNT(CASE WHEN review_status = 'pending' THEN 1 END) as pending_reviews
            FROM reviews
            WHERE entity_id = $1
        `;

        const statsResult = await client.query(statsQuery, [entity_id]);

        res.json({
            success: true,
            reviews: result.rows,
            statistics: statsResult.rows[0]
        });
    } catch (error) {
        console.error('Get entity dashboard reviews error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ADMIN ROUTES

// Get all reviews for moderation (admin only)
router.get('/admin/moderation', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'pending' } = req.query;
        const offset = (page - 1) * limit;

        const query = `
            SELECT r.review_id, r.title, r.overall_rating, r.review_text, r.category_ratings, r.review_status, r.is_anonymous,
                r.created_at, r.admin_notes, CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as reviewer_name,
                u.email as reviewer_email, r.reviewer_type, e.name as entity_name, e.entity_type
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            JOIN entities e ON r.entity_id = e.entity_id
            WHERE r.review_status = $1
            ORDER BY r.created_at ASC
            LIMIT $2 OFFSET $3
        `;

        const result = await client.query(query, [status, limit, offset]);

        res.json({
            success: true,
            reviews: result.rows
        });
    } catch (error) {
        console.error('Get admin reviews error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Moderate review (admin only)
router.put('/:review_id/moderate', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { review_id } = req.params;
        const { action, admin_notes } = req.body; // action: 'approve', 'reject', 'flag'

        const validActions = ['approve', 'reject', 'flag'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid action. Must be approve, reject, or flag'
            });
        }

        const status = action === 'approve' ? 'approved' :
            action === 'reject' ? 'rejected' : 'flagged';

        // Update review status
        const updateQuery = `
            UPDATE reviews 
            SET review_status = $1, admin_notes = $2, updated_at = NOW()
            WHERE review_id = $3
            RETURNING *
        `;

        const result = await client.query(updateQuery, [status, admin_notes, review_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        // If approved, update entity reputation
        if (action === 'approve') {
            const review = result.rows[0];
            await updateEntityReputation(review.entity_id);
        }

        res.json({
            success: true,
            message: `Review ${action}d successfully`,
            review: result.rows[0]
        });
    } catch (error) {
        console.error('Moderate review error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Helper function to update entity reputation
async function updateEntityReputation(entity_id) {
    try {
        const query = `
            SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total_reviews
            FROM reviews
            WHERE entity_id = $1 AND review_status = 'approved'
        `;

        const result = await client.query(query, [entity_id]);
        const { avg_rating, total_reviews } = result.rows[0];

        const updateQuery = `
            UPDATE entities
            SET reputation_score = $1, total_reviews = $2, updated_at = NOW()
            WHERE entity_id = $3
        `;

        await client.query(updateQuery, [
            avg_rating ? parseFloat(avg_rating).toFixed(2) : 0,
            parseInt(total_reviews),
            entity_id
        ]);
    } catch (error) {
        console.error('Update entity reputation error:', error);
    }
}

// === UNREGISTERED ENTITY REVIEWS ROUTES ===

// Get unregistered entity reviews for admin (admin only)
router.get('/unregistered', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { status = 'pending', limit = 50, entity_name } = req.query;
        
        const reviews = await entityModel.getUnregisteredEntityReviews({
            status,
            limit: parseInt(limit),
            entity_name
        });

        res.json({
            success: true,
            reviews: reviews
        });
    } catch (error) {
        console.error('Get unregistered entity reviews error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get unregistered entity reviews statistics (admin only)
router.get('/unregistered/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const stats = await entityModel.getUnregisteredReviewStats();
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Get unregistered entity reviews stats error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Moderate unregistered entity review (admin only)
router.put('/unregistered/:review_id/moderate', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { review_id } = req.params;
        const { action, admin_notes } = req.body; // action: 'approve', 'reject', 'flag'

        const validActions = ['approve', 'reject', 'flag'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid action. Must be approve, reject, or flag'
            });
        }

        const result = await entityModel.moderateUnregisteredEntityReview(review_id, action, admin_notes);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Unregistered review not found'
            });
        }

        res.json({
            success: true,
            message: `Unregistered entity review ${action}d successfully`,
            review: result
        });
    } catch (error) {
        console.error('Moderate unregistered entity review error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Convert unregistered entity review to registered entity and review (admin only)
router.post('/unregistered/:review_id/convert', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { review_id } = req.params;
        const { entity_type = 'network' } = req.body;

        const validEntityTypes = ['advertiser', 'network', 'affiliate'];
        if (!validEntityTypes.includes(entity_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid entity type. Must be advertiser, network, or affiliate'
            });
        }

        const result = await entityModel.convertUnregisteredReviewToEntity(review_id, entity_type);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Unregistered review not found or already processed'
            });
        }

        res.json({
            success: true,
            message: 'Unregistered entity review converted to registered entity successfully',
            entity: result.entity,
            review: result.review,
            original_review: result.original_review
        });
    } catch (error) {
        console.error('Convert unregistered entity review error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        });
    }
});

module.exports = router;
