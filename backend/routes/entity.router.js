const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { entityModel } = require('../models/entity.model.pg');
const {
    validateEntityRegistration,
    validateEntityUpdate,
    validateVerificationUpdate,
    handleValidationErrors
} = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/public', async (req, res, next) => {
    try {
        const { entity_type } = req.query;

        const filters = {
            is_public: true,
            verification_status: 'approved'
        };

        if (entity_type) filters.entity_type = entity_type;

        const entities = await entityModel.getAllEntities(filters);

        // Remove sensitive information for public view
        const publicEntities = entities.map(entity => ({
            entity_id: entity.entity_id,
            entity_type: entity.entity_type,
            name: entity.name,
            website: entity.website,
            description: entity.description,
            reputation_score: entity.reputation_score,
            total_reviews: entity.total_reviews,
            created_at: entity.created_at,
            entity_metadata: entity.entity_metadata
        }));

        res.json({ entities: publicEntities, count: publicEntities.length });
    } catch (error) {
        console.error('Get public entities error:', error);
        next(error);
    }
});

router.get('/type/:type', async (req, res, next) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const validTypes = ['advertiser', 'affiliate', 'network'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                message: 'Invalid entity type. Must be one of: advertiser, affiliate, network'
            });
        }

        const result = await entityModel.getEntitiesByType(type, parseInt(page), parseInt(limit));

        res.json({ message: `${type}s retrieved successfully`, ...result });
    } catch (error) {
        console.error('Get entities by type error:', error);
        next(error);
    }
});

// Get entity metadata template for a specific entity type
router.get('/metadata/template/:type', (req, res) => {
    try {
        const { type } = req.params;

        const validTypes = ['advertiser', 'affiliate', 'network'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                message: 'Invalid entity type. Must be one of: advertiser, affiliate, network'
            });
        }

        const template = entityModel.createDefaultMetadata(type);

        // Add common fields info
        const commonFields = {
            name: "string - Entity name",
            email: "string - Primary email address",
            contact_info: {
                phone: "string - Phone number",
                teams: "string - Microsoft Teams contact",
                linkedin: "string - LinkedIn profile URL",
                telegram: "string - Telegram handle",
                address: "string - Physical address"
            },
            secondary_email: "string - Secondary email address",
            description: "string - Entity description",
            additional_notes: "string - Additional notes",
            how_you_heard: "string - How they heard about the platform",
            website: "string - Website URL"
        };

        res.json({
            message: `Metadata template for ${type}`,
            entity_type: type,
            common_fields: commonFields,
            type_specific_metadata: template,
            example: {
                ...commonFields,
                entity_metadata: template
            }
        });
    } catch (error) {
        console.error('Get metadata template error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Entity registration route (no authentication required for self-registration)
router.post('/register',
    validateEntityRegistration,
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const { entity_type, name, email, secondary_email, website_url, contact_info, description, additional_notes,
                how_you_heard, entity_metadata } = req.body;

            // Validation
            if (!entity_type || !name || !email || !website_url || !contact_info || !description || !entity_metadata) {
                return res.status(400).json({
                    message: 'All required fields must be provided',
                    required: ['entity_type', 'name', 'email', 'website_url', 'contact_info', 'description', 'entity_metadata']
                });
            }

            // Validate entity type
            const validTypes = ['advertiser', 'affiliate', 'network'];
            if (!validTypes.includes(entity_type)) {
                return res.status(400).json({ message: 'Invalid entity type. Must be one of: advertiser, affiliate, network' });
            }

            // Validate contact info has at least one contact method
            if (!contact_info.phone && !contact_info.telegram && !contact_info.teams && !contact_info.linkedin && !contact_info.address) {
                return res.status(400).json({ message: 'At least one contact method is required (phone, telegram, teams, linkedin, or address)' });
            }

            // Validate entity metadata based on entity type
            try {
                entityModel.validateEntityMetadata(entity_type, entity_metadata);
            } catch (metadataError) {
                return res.status(400).json({ message: metadataError.message });
            }

            // Check if entity already exists with this email
            const existingEntity = await entityModel.getEntityByEmail(email);
            if (existingEntity) {
                return res.status(400).json({ message: 'Entity already exists with this email' });
            }

            // Create new entity
            const entity = await entityModel.createEntity({
                entity_type,
                name,
                email,
                secondary_email,
                website_url,
                contact_info,
                description,
                additional_notes,
                how_you_heard,
                entity_metadata
            });

            // IMPORTANT: Ensure entity is created with 'pending' status and NO emails are sent during registration
            console.log(`Entity registration completed: ${entity.name} (${entity.entity_id}) - Status: ${entity.verification_status}`);
            
            // Verification: Ensure the entity is pending and no email logic is triggered here
            if (entity.verification_status !== 'pending') {
                console.warn(`WARNING: Entity ${entity.entity_id} was not created with 'pending' status. Current status: ${entity.verification_status}`);
            }

            res.status(201).json({
                message: 'Entity registered successfully. Pending verification.',
                entity: {
                    entity_id: entity.entity_id,
                    entity_type: entity.entity_type,
                    name: entity.name,
                    email: entity.email,
                    secondary_email: entity.secondary_email,
                    website_url: entity.website_url,
                    description: entity.description,
                    verification_status: entity.verification_status,
                    created_at: entity.created_at
                }
            });
        } catch (error) {
            console.error('Entity registration error:', error);
            if (error.code === '23505') { // Unique constraint violation
                return res.status(400).json({
                    message: 'Entity with this email already exists'
                });
            }
            next(error);
        }
    }
);

// Protected routes (authentication required)
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const { entity_type, verification_status, is_public } = req.query;

        const filters = {};
        if (entity_type) filters.entity_type = entity_type;
        if (verification_status) filters.verification_status = verification_status;
        if (is_public !== undefined) filters.is_public = is_public === 'true';

        const entities = await entityModel.getAllEntities(filters);

        res.json({
            entities,
            count: entities.length,
            filters: filters
        });
    } catch (error) {
        console.error('Get all entities error:', error);
        next(error);
    }
});

// Get entity statistics (authentication required)
router.get('/statistics', authenticateToken, async (req, res, next) => {
    try {
        const stats = await entityModel.getEntityStatistics();

        res.json({
            message: 'Entity statistics retrieved successfully',
            statistics: stats
        });
    } catch (error) {
        console.error('Get entity statistics error:', error);
        next(error);
    }
});

// Get entities by specific criteria in metadata (authentication required)
router.get('/by-criteria', authenticateToken, async (req, res, next) => {
    try {
        const {
            entity_type,
            verticals,
            payment_terms,
            supported_models,
            min_payout,
            page = 1,
            limit = 10
        } = req.query;

        if (!entity_type) {
            return res.status(400).json({
                message: 'entity_type is required'
            });
        }

        const validTypes = ['advertiser', 'affiliate', 'network'];
        if (!validTypes.includes(entity_type)) {
            return res.status(400).json({
                message: 'Invalid entity type. Must be one of: advertiser, affiliate, network'
            });
        }

        const filters = {
            entity_type,
            is_public: true,
            verification_status: 'approved'
        };

        if (verticals) filters.verticals = verticals.split(',');
        if (payment_terms) filters.payment_terms = payment_terms;
        if (supported_models) filters.supported_models = supported_models.split(',');

        const result = await entityModel.searchEntities(filters, parseInt(page), parseInt(limit));

        // Filter by min_payout if specified (for networks)
        if (min_payout && entity_type === 'network') {
            result.entities = result.entities.filter(entity => {
                const minPayoutValue = entity.entity_metadata?.minimum_payout || 0;
                return minPayoutValue >= parseInt(min_payout);
            });
        }

        res.json({
            message: `${entity_type}s matching criteria retrieved successfully`,
            ...result
        });
    } catch (error) {
        console.error('Get entities by criteria error:', error);
        next(error);
    }
});

// Advanced search route (must come before /:id route)
router.get('/search', authenticateToken, async (req, res, next) => {
    try {
        const {
            entity_type,
            verification_status,
            is_public,
            search_term,
            min_reputation,
            verticals,
            payment_terms,
            supported_models,
            page = 1,
            limit = 10
        } = req.query;

        // Parse array parameters
        const parsedVerticals = verticals ? verticals.split(',') : null;
        const parsedModels = supported_models ? supported_models.split(',') : null;

        const filters = {
            entity_type,
            verification_status,
            is_public: is_public !== undefined ? is_public === 'true' : undefined,
            search_term,
            min_reputation: min_reputation ? parseFloat(min_reputation) : null,
            verticals: parsedVerticals,
            payment_terms,
            supported_models: parsedModels
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === null) {
                delete filters[key];
            }
        });

        const result = await entityModel.searchEntities(filters, parseInt(page), parseInt(limit));

        res.json({
            message: 'Entities search completed',
            ...result
        });
    } catch (error) {
        console.error('Search entities error:', error);
        next(error);
    }
});

// Get public entity details by ID (no authentication required)
router.get('/public/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const entity = await entityModel.getEntityById(id);
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        // Return only public information
        const publicEntity = {
            entity_id: entity.entity_id,
            entity_type: entity.entity_type,
            name: entity.name,
            website: entity.website,
            description: entity.description,
            reputation_score: entity.reputation_score,
            total_reviews: entity.total_reviews,
            created_at: entity.created_at,
            entity_metadata: entity.entity_metadata,
            verification_status: entity.verification_status
        };

        res.json({
            entity: publicEntity
        });
    } catch (error) {
        console.error('Get public entity by ID error:', error);
        next(error);
    }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        const entity = await entityModel.getEntityById(id);
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        res.json({
            entity
        });
    } catch (error) {
        console.error('Get entity by ID error:', error);
        next(error);
    }
});

router.put('/:id',
    authenticateToken,
    validateEntityUpdate,
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                name,
                email,
                secondary_email,
                website,
                contact_info,
                description,
                additional_notes,
                how_you_heard,
                entity_metadata,
                is_public
            } = req.body;

            // Check if entity exists
            const existingEntity = await entityModel.getEntityById(id);
            if (!existingEntity) {
                return res.status(404).json({ message: 'Entity not found' });
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== existingEntity.email) {
                const entityWithEmail = await entityModel.getEntityByEmail(email);
                if (entityWithEmail && entityWithEmail.entity_id !== id) {
                    return res.status(400).json({
                        message: 'Email already taken by another entity'
                    });
                }
            }

            // Validate contact info if provided
            if (contact_info && !contact_info.phone && !contact_info.telegram && !contact_info.teams && !contact_info.linkedin && !contact_info.address) {
                return res.status(400).json({
                    message: 'At least one contact method is required (phone, telegram, teams, linkedin, or address)'
                });
            }

            // Validate entity metadata if provided
            if (entity_metadata) {
                try {
                    entityModel.validateEntityMetadata(existingEntity.entity_type, entity_metadata);
                } catch (metadataError) {
                    return res.status(400).json({ message: metadataError.message });
                }
            }

            const updatedEntity = await entityModel.updateEntity(id, {
                name,
                email,
                secondary_email,
                website,
                contact_info,
                description,
                additional_notes,
                how_you_heard,
                entity_metadata,
                is_public
            });

            res.json({
                message: 'Entity updated successfully',
                entity: updatedEntity
            });
        } catch (error) {
            console.error('Update entity error:', error);
            if (error.code === '23505') { // Unique constraint violation
                return res.status(400).json({
                    message: 'Email already taken by another entity'
                });
            }
            next(error);
        }
    }
);

// Admin only routes
router.put('/:id/verification',
    authenticateToken,
    requireRole(['admin']),
    validateVerificationUpdate,
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { verification_status, admin_notes } = req.body;
            console.log(req.user);

            const validStatuses = ['pending', 'approved', 'rejected', 'on_hold'];
            if (!validStatuses.includes(verification_status)) {
                return res.status(400).json({
                    message: 'Invalid verification status. Must be one of: pending, approved, rejected, on_hold'
                });
            }

            // Check if entity exists
            const entity = await entityModel.getEntityById(id);
            if (!entity) {
                return res.status(404).json({ message: 'Entity not found' });
            }

            const updatedEntity = await entityModel.updateVerificationStatus({ entity_id: id, verification_status: verification_status, admin_user_id: req.user.user_id, admin_notes });

            // Create user account only when entity is being approved
            if (verification_status === 'approved') {
                try {
                    // IMPORTANT: Check if entity was already approved to prevent duplicate emails
                    if (entity.verification_status === 'approved') {
                        console.log(`Entity ${entity.entity_id} is already approved. Skipping email sending to prevent duplicates.`);
                        return res.json({
                            message: 'Entity verification status updated successfully',
                            entity: updatedEntity
                        });
                    }

                    // Import the mailer service
                    const { sendWelcomeEmail } = require('../utilities/mailerService');
                    
                    console.log(`Entity ${entity.entity_id} being approved. Current status: ${entity.verification_status} -> ${verification_status}`);
                    
                    // Create user account for approved entity
                    const { user, tempPassword } = await entityModel.createUserAccountForEntity(entity);
                    console.log('User account temp password:', tempPassword);

                    // Send welcome email with login credentials
                    const emailResult = await sendWelcomeEmail(entity, user, tempPassword);
                    console.log('Email sending result:', emailResult);

                    // Update entity with user account created flag
                    const linkedEntity = await entityModel.linkEntityToUser(entity.entity_id, user.user_id);
                    console.log('Entity linked to user account:', linkedEntity);
                    
                    // Update the response entity with the user account created flag
                    updatedEntity.user_account_created = true;
                } catch (accountError) {
                    console.error('Error creating user account for entity:', accountError);
                    // Continue with approval even if account creation fails
                    // We don't want to block the approval process
                }
            }

            res.json({
                message: 'Entity verification status updated successfully',
                entity: updatedEntity
            });
        } catch (error) {
            console.error('Update verification status error:', error);
            next(error);
        }
    }
);

// Get entities pending verification (admin only)
router.get('/admin/pending-verification',
    authenticateToken,
    requireRole(['admin']),
    async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query;

            const result = await entityModel.getEntitiesPendingVerification(parseInt(page), parseInt(limit));

            res.json({
                message: 'Pending verification entities retrieved successfully',
                ...result
            });
        } catch (error) {
            console.error('Get pending verification entities error:', error);
            next(error);
        }
    }
);

// Bulk update verification status (admin only)
router.put('/admin/bulk-verification',
    authenticateToken,
    requireRole(['admin']),
    async (req, res, next) => {
        try {
            const { entity_ids, verification_status, admin_notes } = req.body;

            if (!entity_ids || !Array.isArray(entity_ids) || entity_ids.length === 0) {
                return res.status(400).json({
                    message: 'entity_ids array is required and must not be empty'
                });
            }

            if (!verification_status) {
                return res.status(400).json({
                    message: 'verification_status is required'
                });
            }

            const validStatuses = ['pending', 'approved', 'rejected', 'on_hold'];
            if (!validStatuses.includes(verification_status)) {
                return res.status(400).json({
                    message: 'Invalid verification status. Must be one of: pending, approved, rejected, on_hold'
                });
            }

            const updatedEntities = await entityModel.bulkUpdateVerificationStatus(
                entity_ids,
                verification_status,
                req.user.user_id,
                admin_notes
            );

            // Create user accounts for approved entities
            if (verification_status === 'approved') {
                const { sendWelcomeEmail } = require('../utilities/mailerService');
                const accountCreationResults = [];

                // Process accounts sequentially to avoid race conditions
                for (const entity of updatedEntities) {
                    try {
                        // IMPORTANT: Check if entity was already approved to prevent duplicate emails
                        console.log(`Processing entity ${entity.entity_id} for approval. Previous status: ${entity.verification_status}`);
                        
                        // Skip if entity was already approved (to prevent duplicate emails)
                        if (entity.verification_status === 'approved' && entity.user_account_created) {
                            console.log(`Entity ${entity.entity_id} already has user account created. Skipping email.`);
                            accountCreationResults.push({
                                entity_id: entity.entity_id,
                                success: true,
                                email_sent: false,
                                message: 'Already approved and has user account'
                            });
                            continue;
                        }

                        // Create user account for entity
                        const { user, tempPassword } = await entityModel.createUserAccountForEntity(entity);
                        
                        // Send welcome email with login credentials
                        const emailResult = await sendWelcomeEmail(entity, user, tempPassword);
                        console.log(`Email sending result for ${entity.name}:`, emailResult);
                        
                        // Update entity with user account created flag
                        const linkedEntity = await entityModel.linkEntityToUser(entity.entity_id, user.user_id);
                        console.log(`Entity linked to user account: ${entity.name}`);
                        
                        // Store the results
                        accountCreationResults.push({
                            entity_id: entity.entity_id,
                            success: true,
                            email_sent: emailResult.success
                        });
                    } catch (accountError) {
                        console.error(`Error creating user account for entity ${entity.entity_id}:`, accountError);
                        accountCreationResults.push({
                            entity_id: entity.entity_id,
                            success: false,
                            error: accountError.message
                        });
                    }
                }

                // Update the response to include account creation results
                res.json({
                    message: `${updatedEntities.length} entities verification status updated successfully`,
                    updated_entities: updatedEntities,
                    verification_status: verification_status,
                    account_creation_results: accountCreationResults
                });
            } else {
                res.json({
                    message: `${updatedEntities.length} entities verification status updated successfully`,
                    updated_entities: updatedEntities,
                    verification_status: verification_status
                });
            }
        } catch (error) {
            console.error('Bulk update verification status error:', error);
            next(error);
        }
    }
);

// Update entity reputation (internal use, could be called by review system)
router.put('/:id/reputation',
    authenticateToken,
    requireRole(['admin', 'system']),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { new_rating } = req.body;

            if (!new_rating || new_rating < 1 || new_rating > 5) {
                return res.status(400).json({
                    message: 'new_rating is required and must be between 1 and 5'
                });
            }

            // Check if entity exists
            const entity = await entityModel.getEntityById(id);
            if (!entity) {
                return res.status(404).json({ message: 'Entity not found' });
            }

            const updatedReputation = await entityModel.updateEntityReputation(id, parseFloat(new_rating));

            res.json({
                message: 'Entity reputation updated successfully',
                entity_id: id,
                previous_score: entity.reputation_score,
                previous_reviews: entity.total_reviews,
                new_score: updatedReputation.reputation_score,
                new_review_count: updatedReputation.total_reviews
            });
        } catch (error) {
            console.error('Update entity reputation error:', error);
            next(error);
        }
    }
);

// Validate entity data before submission (public route)
router.post('/validate', async (req, res, next) => {
    try {
        const {
            entity_type,
            name,
            email,
            secondary_email,
            website,
            contact_info,
            description,
            additional_notes,
            how_you_heard,
            entity_metadata
        } = req.body;

        const errors = [];
        const warnings = [];

        // Basic validation
        if (!entity_type) errors.push('entity_type is required');
        if (!name) errors.push('name is required');
        if (!email) errors.push('email is required');
        if (!website) errors.push('website is required');
        if (!contact_info) errors.push('contact_info is required');
        if (!description) errors.push('description is required');
        if (!entity_metadata) errors.push('entity_metadata is required');

        // Validate entity type
        const validTypes = ['advertiser', 'affiliate', 'network'];
        if (entity_type && !validTypes.includes(entity_type)) {
            errors.push('Invalid entity type. Must be one of: advertiser, affiliate, network');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push('Invalid email format');
        }

        if (secondary_email && !emailRegex.test(secondary_email)) {
            errors.push('Invalid secondary email format');
        }

        // Website URL validation
        if (website) {
            try {
                new URL(website);
            } catch (e) {
                errors.push('Invalid website URL format');
            }
        }

        // Contact info validation
        if (contact_info) {
            const hasContactMethod = contact_info.phone ||
                contact_info.telegram ||
                contact_info.teams ||
                contact_info.linkedin ||
                contact_info.address;

            if (!hasContactMethod) {
                errors.push('At least one contact method is required (phone, telegram, teams, linkedin, or address)');
            }

            // Validate LinkedIn URL if provided
            if (contact_info.linkedin && !contact_info.linkedin.includes('linkedin.com')) {
                warnings.push('LinkedIn URL should contain linkedin.com');
            }
        }

        // Entity metadata validation
        if (entity_type && entity_metadata) {
            try {
                entityModel.validateEntityMetadata(entity_type, entity_metadata);
            } catch (metadataError) {
                errors.push(metadataError.message);
            }
        }

        // Check if email already exists
        if (email) {
            const existingEntity = await entityModel.getEntityByEmail(email);
            if (existingEntity) {
                errors.push('Entity already exists with this email');
            }
        }

        // Additional warnings
        if (description && description.length < 50) {
            warnings.push('Description should be at least 50 characters for better visibility');
        }

        if (entity_metadata) {
            if (entity_type === 'network' && entity_metadata.offers_available === 0) {
                warnings.push('Networks with 0 offers available may have lower visibility');
            }

            if (entity_type === 'affiliate' && entity_metadata.monthly_revenue === 0) {
                warnings.push('Providing monthly revenue information helps with credibility');
            }
        }

        const isValid = errors.length === 0;

        res.json({
            is_valid: isValid,
            errors: errors,
            warnings: warnings,
            message: isValid ? 'Entity data is valid' : 'Entity data has validation errors'
        });

    } catch (error) {
        console.error('Validate entity data error:', error);
        next(error);
    }
});

// Get entity by email (protected route)
router.get('/email/:email', authenticateToken, async (req, res, next) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: 'Email parameter is required' });
        }

        const entity = await entityModel.getEntityByEmail(email);

        if (!entity) {
            return res.status(404).json({ message: 'Entity not found with this email' });
        }

        res.json({
            message: 'Entity found',
            entity: entity
        });
    } catch (error) {
        console.error('Get entity by email error:', error);
        next(error);
    }
});

// Debug route to check entity status (can be removed in production)
router.get('/debug/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const entity = await entityModel.getEntityById(id);
        
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        res.json({
            entity_id: entity.entity_id,
            name: entity.name,
            email: entity.email,
            verification_status: entity.verification_status,
            user_account_created: entity.user_account_created,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            message: `Entity status: ${entity.verification_status}. User account created: ${entity.user_account_created}. Emails should only be sent when status is 'approved' and user_account_created is false.`
        });
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;