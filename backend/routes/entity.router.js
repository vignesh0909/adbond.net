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
router.get('/public', authenticateToken, async (req, res, next) => {
    try {
        const { entity_type } = req.query;
        const { email } = req.user || '';

        const filters = {
            is_public: true,
            verification_status: 'approved'
        };

        if (entity_type) filters.entity_type = entity_type;

        const entities = await entityModel.getVerifiedEntities(filters);

        // Filter out the caller's entity data
        const filteredEntities = entities.filter(entity => entity.email !== email);

        // Remove sensitive information for public view
        const publicEntities = filteredEntities.map(entity => ({
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
                telegram: "string - Telegram handle"
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
router.post('/register', validateEntityRegistration, handleValidationErrors, async (req, res, next) => {
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

        // Validate phone number is provided
        if (!contact_info.phone || typeof contact_info.phone !== 'string' || contact_info.phone.trim() === '') {
            return res.status(400).json({ message: 'Phone number is required' });
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
            entity_type, name, email, secondary_email, website_url, contact_info, description,
            additional_notes, how_you_heard, entity_metadata
        });

        // IMPORTANT: Ensure entity is created with 'pending' status and NO emails are sent during registration
        console.log(`Entity registration completed: ${entity.name} (${entity.entity_id}) - Status: ${entity.verification_status}`);

        // Verification: Ensure the entity is pending and no email logic is triggered here
        if (entity.verification_status !== 'pending') {
            console.warn(`WARNING: Entity ${entity.entity_id} was not created with 'pending' status. Current status: ${entity.verification_status}`);
        }

        // Send admin notification email about new entity registration
        try {
            const emailService = require('../services/emailService');
            const emailResult = await emailService.sendAdminNotificationEmail(entity);
            if (emailResult.success) {
                console.log(`Admin notification email sent successfully for entity: ${entity.name}`);
            } else {
                console.error(`Failed to send admin notification email for entity: ${entity.name}`, emailResult.error);
            }
        } catch (emailError) {
            console.error('Error sending admin notification email:', emailError);
            // Continue with registration even if admin email fails
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
            const { name, email, secondary_email, website, contact_info, description, additional_notes, how_you_heard, entity_metadata, is_public } = req.body;

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
                name, email, secondary_email, website, contact_info, description, additional_notes,
                how_you_heard, entity_metadata, is_public
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
router.put('/:id/verification', authenticateToken, requireRole(['admin']), validateVerificationUpdate, handleValidationErrors, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { verification_status, admin_notes } = req.body;

        const validStatuses = ['pending', 'approved', 'rejected', 'on_hold', 'deleted'];
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

        const updatedEntity = await entityModel.updateVerificationStatus({ entity_id: id, verification_status, admin_user_id: req.user.user_id, admin_notes });

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
                const { sendWelcomeEmail } = require('../services/emailService');

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

        // Notify when entity is rejected
        if (verification_status === 'rejected') {
            try {
                // Avoid duplicate notifications if it was already rejected
                if (entity.verification_status !== 'rejected') {
                    const { sendEntityRejectionEmail } = require('../services/emailService');
                    await sendEntityRejectionEmail(entity, admin_notes || '');
                } else {
                    console.log(`Entity ${entity.entity_id} already rejected previously. Skipping rejection email.`);
                }
            } catch (mailErr) {
                console.error('Error sending rejection email:', mailErr);
                // Non-blocking: do not fail the API on email issues
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
router.get('/admin/pending-verification', authenticateToken, requireRole(['admin']), async (req, res, next) => {
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
router.put('/admin/bulk-verification', authenticateToken, requireRole(['admin']), async (req, res, next) => {
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
            const { sendWelcomeEmail } = require('../services/emailService');
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
router.put('/:id/reputation', authenticateToken, requireRole(['admin', 'system']), async (req, res, next) => {
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
});

// Delete entity (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if entity exists
        const entity = await entityModel.getEntityById(id);
        if (!entity) {
            return res.status(404).json({ message: 'Entity not found' });
        }

        // Store entity info for response before deletion
        const entityInfo = {
            entity_id: entity.entity_id,
            name: entity.name,
            email: entity.email,
            entity_type: entity.entity_type,
            verification_status: entity.verification_status
        };

        // Delete the entity (this will cascade to related records due to ON DELETE CASCADE)
        await entityModel.deleteEntity(id);

        console.log(`Entity deleted by admin ${req.user.user_id}: ${entityInfo.name} (${entityInfo.entity_id})`);

        res.json({
            message: 'Entity deleted successfully',
            deleted_entity: entityInfo
        });
    } catch (error) {
        console.error('Delete entity error:', error);
        
        // Handle foreign key constraint errors
        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Cannot delete entity due to existing references. Please remove related records first.'
            });
        }
        
        next(error);
    }
});

module.exports = router;