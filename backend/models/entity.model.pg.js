const client = require('./db_connection.js').pool;
const { v4: uuidv4 } = require('uuid');

const createEntitysTableQuery = `
CREATE TABLE IF NOT EXISTS entities (
    entity_id TEXT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('advertiser', 'network', 'affiliate')),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    secondary_email VARCHAR(255),
    website VARCHAR(500) NOT NULL,
    contact_info JSONB NOT NULL,
    description TEXT NOT NULL,
    additional_notes TEXT,
    how_you_heard TEXT,
    entity_metadata JSONB NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'on_hold')),
    approved_by TEXT REFERENCES users(user_id),
    flag_history JSONB,
    reputation_score DECIMAL(3,2) DEFAULT 0.00 CHECK (reputation_score >= 0 AND reputation_score <= 5),
    total_reviews INTEGER DEFAULT 0,
    user_account_created BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        contact_info ? 'phone'
    )
);

-- Add missing column if it doesn't exist
ALTER TABLE entities ADD COLUMN IF NOT EXISTS user_account_created BOOLEAN DEFAULT FALSE;

-- Indexes for entities
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_reputation ON entities(reputation_score);
CREATE INDEX IF NOT EXISTS idx_entities_public ON entities(is_public);
CREATE INDEX IF NOT EXISTS idx_entities_email ON entities(email);
CREATE INDEX IF NOT EXISTS idx_entities_verification ON entities(verification_status);
CREATE INDEX IF NOT EXISTS idx_entities_approved_by ON entities(approved_by);
`;

const createReviewsTableQuery = `
CREATE TABLE IF NOT EXISTS reviews (
    review_id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('user', 'advertiser', 'network', 'affiliate')),
    title VARCHAR(200) NOT NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    category_ratings JSONB NOT NULL,
    proof_attachments JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'disputed', 'rejected', 'flagged')),
    admin_notes TEXT,
    dispute_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (category_ratings ? 'quality' AND category_ratings ? 'support' AND category_ratings ? 'reliability' AND category_ratings ? 'payment_speed')
);
 -- Indexes for reviews
    CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(overall_rating);
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(review_status);
    CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
`;

const createReviewRepliesTableQuery = `
CREATE TABLE IF NOT EXISTS review_replies (
    reply_id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    reply_type VARCHAR(20) DEFAULT 'response' CHECK (reply_type IN ('response', 'dispute', 'clarification')),
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 -- Index for review replies
    CREATE INDEX IF NOT EXISTS idx_review_replies_review ON review_replies(review_id);
`;

const createAccessRequestsTableQuery = `
CREATE TABLE IF NOT EXISTS access_requests (
    request_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entity_id TEXT REFERENCES entities(entity_id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('contact_info', 'offer_access', 'partnership')),
    request_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'rejected', 'expired')),
    approved_by TEXT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Index for access requests
    CREATE INDEX IF NOT EXISTS idx_access_requests_user ON access_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_access_requests_entity ON access_requests(entity_id);
    CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(request_status);
`;

const createUnregisteredEntityReviewsTableQuery = `
CREATE TABLE IF NOT EXISTS unregistered_entity_reviews (
    review_id TEXT PRIMARY KEY,
    entity_name VARCHAR(200) NOT NULL,
    entity_website VARCHAR(500),
    entity_description TEXT,
    entity_contact_info JSONB,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('user', 'advertiser', 'network', 'affiliate')),
    title VARCHAR(200) NOT NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    category_ratings JSONB NOT NULL,
    proof_attachments JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'flagged', 'converted')),
    admin_notes TEXT,
    dispute_reason TEXT,
    converted_entity_id TEXT REFERENCES entities(entity_id),
    converted_review_id TEXT REFERENCES reviews(review_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (category_ratings ? 'quality' AND category_ratings ? 'support' AND category_ratings ? 'reliability' AND category_ratings ? 'payment_speed')
);

-- Indexes for unregistered entity reviews
CREATE INDEX IF NOT EXISTS idx_unregistered_reviews_entity_name ON unregistered_entity_reviews(entity_name);
CREATE INDEX IF NOT EXISTS idx_unregistered_reviews_user ON unregistered_entity_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_unregistered_reviews_status ON unregistered_entity_reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_unregistered_reviews_created ON unregistered_entity_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_unregistered_reviews_rating ON unregistered_entity_reviews(overall_rating);
`;

const tables = [
    { name: 'entities', query: createEntitysTableQuery },
    { name: 'reviews', query: createReviewsTableQuery },
    { name: 'review_replies', query: createReviewRepliesTableQuery },
    { name: 'access_requests', query: createAccessRequestsTableQuery },
    { name: 'unregistered_entity_reviews', query: createUnregisteredEntityReviewsTableQuery }
];

tables.forEach(table => {
    client.query(table.query, (err, res) => {
        if (err) {
            console.error(`Error creating ${table.name} table:`, err);
            if (err.code === '42P07') {
                console.log(`Table "${table.name}" already exists`);
            } else {
                console.log(`Error creating ${table.name} table:`, err.message);
            }
            return;
        }
        console.log(`${table.name} table created successfully`);
    });
});

// Entity model methods
const entityModel = {
    // Validate and structure entity metadata based on entity type
    validateEntityMetadata(entity_type, metadata) {
        const commonFields = ['name', 'email', 'contact_info', 'secondary_email', 'description', 'additional_notes', 'how_you_heard', 'website'];

        // Define required fields for each entity type
        const typeSpecificFields = {
            network: {
                required: ['network_name', 'signup_url', 'tracking_platform', 'supported_models', 'verticals', 'payment_terms'],
                optional: ['offers_available', 'minimum_payout', 'referral_commission']
            },
            affiliate: {
                required: ['verticals', 'monthly_revenue', 'traffic_provided_geos'],
                optional: ['reference_details']
            },
            advertiser: {
                required: ['company_name', 'signup_url', 'program_name', 'program_category', 'payout_types', 'payment_terms'],
                optional: ['social_media', 'referral_commission']
            }
        };

        const requiredFields = typeSpecificFields[entity_type]?.required || [];
        const missingFields = requiredFields.filter(field => !metadata.hasOwnProperty(field));

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields for ${entity_type}: ${missingFields.join(', ')}`);
        }

        return true;
    },

    // Create default metadata structure for entity type
    createDefaultMetadata(entity_type, customData = {}) {
        const defaults = {
            network: {
                network_name: "",
                signup_url: "",
                tracking_platform: "",
                supported_models: [],
                verticals: [],
                payment_terms: "",
                offers_available: 0,
                minimum_payout: 0,
                referral_commission: 0
            },
            affiliate: {
                verticals: [],
                monthly_revenue: 0,
                traffic_provided_geos: [],
                reference_details: {}
            },
            advertiser: {
                company_name: "",
                signup_url: "",
                program_name: "",
                program_category: "",
                social_media: {
                    facebook: "",
                    twitter: "",
                    linkedin: ""
                },
                payout_types: [],
                payment_terms: "",
                referral_commission: 0
            }
        };

        return { ...defaults[entity_type], ...customData };
    },
    // Create a new entity
    async createEntity(entityData) {
        try {
            const { entity_type, name, email, secondary_email, website_url, contact_info, description, additional_notes, how_you_heard, entity_metadata } = entityData;

            const entity_id = uuidv4();

            const query = `
                INSERT INTO entities (
                    entity_id, entity_type, name, email, secondary_email, website, 
                    contact_info, description, additional_notes, how_you_heard, entity_metadata,
                    verification_status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
                RETURNING entity_id, entity_type, name, email, secondary_email, website, 
                         contact_info, description, additional_notes, how_you_heard, 
                         verification_status, approved_by, entity_metadata, reputation_score, 
                         total_reviews, is_public, created_at
            `;

            const values = [
                entity_id, entity_type, name, email, secondary_email, website_url,
                contact_info, description, additional_notes, how_you_heard, entity_metadata
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Get entity by email
    async getEntityByEmail(email) {
        try {
            const query = 'SELECT * FROM entities WHERE email = $1';
            const result = await client.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Get entity by ID
    async getEntityById(entity_id) {
        try {
            const query = `
                SELECT entity_id, entity_type, name, email, secondary_email, website, 
                       contact_info, description, additional_notes, how_you_heard,
                       verification_status, approved_by, entity_metadata, reputation_score, 
                       total_reviews, is_public, user_account_created, created_at, updated_at
                FROM entities 
                WHERE entity_id = $1
            `;
            const result = await client.query(query, [entity_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getAllEntities() {
        try {
            const query = `
                SELECT entity_id, entity_type, name, email, secondary_email, website,
                          contact_info, description, additional_notes, how_you_heard,
                            verification_status, approved_by, entity_metadata, reputation_score,
                            total_reviews, is_public, user_account_created, created_at, updated_at
                FROM entities
                ORDER BY created_at DESC
            `;
            const result = await client.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Get only verified entities
    async getVerifiedEntities() {
        try {
            const query = `
                SELECT entity_id, entity_type, name, email, secondary_email, website, 
                       contact_info, description, additional_notes, how_you_heard,
                       verification_status, approved_by, entity_metadata, reputation_score, 
                       total_reviews, is_public, created_at, updated_at
                FROM entities 
                WHERE verification_status = 'approved'
                ORDER BY created_at DESC
            `;

            const result = await client.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Update entity
    async updateEntity(entity_id, entityData) {
        try {
            const { name, email, secondary_email, website, contact_info, description, additional_notes, how_you_heard,
                entity_metadata, is_public } = entityData;

            const query = `
                UPDATE entities 
                SET name = COALESCE($2, name),
                    email = COALESCE($3, email),
                    secondary_email = COALESCE($4, secondary_email),
                    website = COALESCE($5, website),
                    contact_info = COALESCE($6, contact_info),
                    description = COALESCE($7, description),
                    additional_notes = COALESCE($8, additional_notes),
                    how_you_heard = COALESCE($9, how_you_heard),
                    entity_metadata = COALESCE($10, entity_metadata),
                    is_public = COALESCE($11, is_public),
                    updated_at = CURRENT_TIMESTAMP
                WHERE entity_id = $1
                RETURNING entity_id, entity_type, name, email, secondary_email, website, 
                         contact_info, description, additional_notes, how_you_heard,
                         verification_status, approved_by, entity_metadata, reputation_score, 
                         total_reviews, is_public, created_at, updated_at
            `;

            const values = [
                entity_id, name, email, secondary_email, website, contact_info,
                description, additional_notes, how_you_heard, entity_metadata, is_public
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Update entity verification status (admin only)
    async updateVerificationStatus({ entity_id, verification_status, admin_user_id, admin_notes = null }) {
        try {
            const query = `
                UPDATE entities 
                SET verification_status = $2::VARCHAR,
                    approved_by = CASE WHEN $2::VARCHAR = 'approved' THEN $3 ELSE approved_by END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE entity_id = $1
                RETURNING entity_id, entity_type, name, email, verification_status, approved_by, 
                         updated_at, user_account_created
            `;

            const result = await client.query(query, [entity_id, verification_status, admin_user_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Delete entity
    async deleteEntity(entity_id) {
        try {
            const query = 'DELETE FROM entities WHERE entity_id = $1';
            await client.query(query, [entity_id]);
        } catch (error) {
            throw error;
        }
    },

    // Get entities by type with pagination
    async getEntitiesByType(entity_type, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const query = `
                SELECT entity_id, entity_type, name, email, website, 
                       description, verification_status, entity_metadata,
                       reputation_score, total_reviews, is_public, created_at
                FROM entities 
                WHERE entity_type = $1 AND is_public = true
                ORDER BY reputation_score DESC, created_at DESC
                LIMIT $2 OFFSET $3
            `;

            const countQuery = 'SELECT COUNT(*) FROM entities WHERE entity_type = $1 AND is_public = true';

            const [entitiesResult, countResult] = await Promise.all([
                client.query(query, [entity_type, limit, offset]),
                client.query(countQuery, [entity_type])
            ]);

            return {
                entities: entitiesResult.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            };
        } catch (error) {
            throw error;
        }
    },

    // Search entities with advanced filtering
    async searchEntities(filters = {}, page = 1, limit = 10) {
        try {
            const { entity_type, verification_status, is_public, search_term, min_reputation, verticals, payment_terms, supported_models } = filters;

            const offset = (page - 1) * limit;
            let whereConditions = ['1=1'];
            let values = [];
            let paramCount = 0;

            // Basic filters
            if (entity_type) {
                paramCount++;
                whereConditions.push(`entity_type = $${paramCount}`);
                values.push(entity_type);
            }

            if (verification_status) {
                paramCount++;
                whereConditions.push(`verification_status = $${paramCount}`);
                values.push(verification_status);
            }

            if (is_public !== undefined) {
                paramCount++;
                whereConditions.push(`is_public = $${paramCount}`);
                values.push(is_public);
            }

            if (min_reputation) {
                paramCount++;
                whereConditions.push(`reputation_score >= $${paramCount}`);
                values.push(min_reputation);
            }

            // Text search in name and description
            if (search_term) {
                paramCount++;
                whereConditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
                values.push(`%${search_term}%`);
            }

            // JSON field searches
            if (verticals && verticals.length > 0) {
                paramCount++;
                whereConditions.push(`entity_metadata->'verticals' ?| $${paramCount}`);
                values.push(verticals);
            }

            if (payment_terms) {
                paramCount++;
                whereConditions.push(`entity_metadata->>'payment_terms' = $${paramCount}`);
                values.push(payment_terms);
            }

            if (supported_models && supported_models.length > 0) {
                paramCount++;
                whereConditions.push(`entity_metadata->'supported_models' ?| $${paramCount}`);
                values.push(supported_models);
            }

            const query = `
                SELECT entity_id, entity_type, name, email, website, 
                       description, verification_status, entity_metadata,
                       reputation_score, total_reviews, is_public, created_at
                FROM entities 
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY reputation_score DESC, created_at DESC
                LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
            `;

            const countQuery = `
                SELECT COUNT(*) 
                FROM entities 
                WHERE ${whereConditions.join(' AND ')}
            `;

            values.push(limit, offset);

            const [entitiesResult, countResult] = await Promise.all([
                client.query(query, values),
                client.query(countQuery, values.slice(0, -2)) // Remove limit and offset for count
            ]);

            return {
                entities: entitiesResult.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
                filters
            };
        } catch (error) {
            throw error;
        }
    },

    // Get entity statistics
    async getEntityStatistics() {
        try {
            const query = `
                SELECT 
                    entity_type,
                    verification_status,
                    COUNT(*) as count,
                    AVG(reputation_score) as avg_reputation,
                    AVG(total_reviews) as avg_reviews
                FROM entities 
                GROUP BY entity_type, verification_status
                ORDER BY entity_type, verification_status
            `;

            const totalQuery = `
                SELECT 
                    COUNT(*) as total_entities,
                    COUNT(CASE WHEN is_public = true THEN 1 END) as public_entities,
                    COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_entities,
                    AVG(reputation_score) as overall_avg_reputation
                FROM entities
            `;

            const [statsResult, totalResult] = await Promise.all([
                client.query(query),
                client.query(totalQuery)
            ]);

            return {
                by_type_and_status: statsResult.rows,
                overall: totalResult.rows[0]
            };
        } catch (error) {
            throw error;
        }
    },

    // Update entity reputation and review count
    async updateEntityReputation(entity_id, new_rating) {
        try {
            const entity = await this.getEntityById(entity_id);
            if (!entity) {
                throw new Error('Entity not found');
            }

            const currentTotal = entity.total_reviews;
            const currentScore = entity.reputation_score;

            // Calculate new average rating
            const newTotal = currentTotal + 1;
            const newScore = ((currentScore * currentTotal) + new_rating) / newTotal;

            const query = `
                UPDATE entities 
                SET reputation_score = $2,
                    total_reviews = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE entity_id = $1
                RETURNING entity_id, reputation_score, total_reviews
            `;

            const result = await client.query(query, [entity_id, newScore.toFixed(2), newTotal]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Get entities needing verification (admin function)
    async getEntitiesPendingVerification(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const query = `
                SELECT entity_id, entity_type, name, email, website, 
                       description, entity_metadata, created_at
                FROM entities 
                WHERE verification_status = 'pending'
                ORDER BY created_at ASC
                LIMIT $1 OFFSET $2
            `;

            const countQuery = `
                SELECT COUNT(*) 
                FROM entities 
                WHERE verification_status = 'pending'
            `;

            const [entitiesResult, countResult] = await Promise.all([
                client.query(query, [limit, offset]),
                client.query(countQuery)
            ]);

            return {
                entities: entitiesResult.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            };
        } catch (error) {
            throw error;
        }
    },

    // Bulk update verification status (admin function)
    async bulkUpdateVerificationStatus(entity_ids, verification_status, admin_user_id, admin_notes = null) {
        try {
            const validStatuses = ['pending', 'approved', 'rejected', 'on_hold'];
            if (!validStatuses.includes(verification_status)) {
                throw new Error('Invalid verification status');
            }

            const query = `
                UPDATE entities 
                SET verification_status = $1,
                    approved_by = CASE WHEN $1 = 'approved' THEN $3 ELSE approved_by END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE entity_id = ANY($2)
                RETURNING entity_id, entity_type, name, email, description, website,
                         contact_info, verification_status, approved_by, updated_at
            `;

            const result = await client.query(query, [verification_status, entity_ids, admin_user_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Create user account for entity
    async createUserAccountForEntity(entity) {
        const { userModel } = require('./user.model.pg');

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        // Extract name parts from entity name
        const nameParts = entity.name.split(' ');
        const firstName = nameParts[0] || entity.name;
        const lastName = nameParts.slice(1).join(' ') || '';

        // Set password expiry (24 hours from now)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);

        // Create user account
        const userData = {
            first_name: firstName,
            last_name: lastName,
            email: entity.email,
            password: tempPassword,
            role: entity.entity_type, // advertiser, affiliate, network
            entity_id: entity.entity_id,
            password_reset_required: true,
            temp_password_expires: expiryDate,
            email_verified: true // Entity users are pre-approved by admin and don't need email verification
        };

        const user = await userModel.createUser(userData);

        return { user, tempPassword };
    },

    // Link entity to user
    async linkEntityToUser(entity_id, user_id) {
        try {
            // Update entity with user_id reference
            const query = `
                UPDATE entities
                SET user_account_created = TRUE
                WHERE entity_id = $1
                RETURNING entity_id, name, email, verification_status
            `;

            const result = await client.query(query, [entity_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Unregistered Entity Reviews Methods
    async createUnregisteredEntityReview(reviewData) {
        try {
            const {
                review_id,
                entity_name,
                entity_website,
                entity_description,
                entity_contact_info,
                user_id,
                reviewer_type,
                title,
                overall_rating,
                review_text,
                category_ratings,
                proof_attachments = [],
                tags = [],
                is_anonymous = false
            } = reviewData;

            const query = `
                INSERT INTO unregistered_entity_reviews (
                    review_id, entity_name, entity_website, entity_description, entity_contact_info,
                    user_id, reviewer_type, title, overall_rating, review_text, category_ratings,
                    proof_attachments, tags, is_anonymous, review_status, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending', NOW(), NOW()
                )
                RETURNING *
            `;

            const values = [
                review_id, entity_name, entity_website, entity_description, 
                JSON.stringify(entity_contact_info || {}), user_id, reviewer_type, title, 
                overall_rating, review_text, JSON.stringify(category_ratings),
                JSON.stringify(proof_attachments), JSON.stringify(tags), is_anonymous
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getUnregisteredEntityReviews(filters = {}) {
        try {
            const { status = 'pending', limit = 50, offset = 0, entity_name } = filters;
            
            let whereClause = 'WHERE review_status = $1';
            let queryParams = [status, limit, offset];
            let paramCount = 1;

            if (entity_name) {
                paramCount++;
                whereClause += ` AND entity_name ILIKE $${paramCount}`;
                queryParams.splice(-2, 0, `%${entity_name}%`);
            }

            const query = `
                SELECT 
                    uer.review_id, uer.entity_name, uer.entity_website, uer.entity_description,
                    uer.entity_contact_info, uer.title, uer.overall_rating, uer.review_text,
                    uer.category_ratings, uer.tags, uer.is_anonymous, uer.review_status,
                    uer.admin_notes, uer.created_at, uer.updated_at,
                    CASE 
                        WHEN uer.is_anonymous = true THEN 'Anonymous'
                        ELSE CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))
                    END as reviewer_name,
                    uer.reviewer_type
                FROM unregistered_entity_reviews uer
                LEFT JOIN users u ON uer.user_id = u.user_id
                ${whereClause}
                ORDER BY uer.created_at ASC
                LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
            `;

            const result = await client.query(query, queryParams);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    async moderateUnregisteredEntityReview(review_id, action, admin_notes = '') {
        try {
            const validActions = ['approve', 'reject', 'flag', 'convert'];
            if (!validActions.includes(action)) {
                throw new Error('Invalid action');
            }

            const status = action === 'approve' ? 'approved' :
                action === 'reject' ? 'rejected' :
                action === 'flag' ? 'flagged' : 'converted';

            const query = `
                UPDATE unregistered_entity_reviews
                SET review_status = $1, admin_notes = $2, updated_at = NOW()
                WHERE review_id = $3
                RETURNING *
            `;

            const result = await client.query(query, [status, admin_notes, review_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async convertUnregisteredReviewToEntity(review_id, entity_type = 'network') {
        try {
            // Get the unregistered review
            const getReviewQuery = `
                SELECT * FROM unregistered_entity_reviews 
                WHERE review_id = $1 AND review_status = 'pending'
            `;
            const reviewResult = await client.query(getReviewQuery, [review_id]);
            
            if (reviewResult.rows.length === 0) {
                throw new Error('Unregistered review not found or already processed');
            }

            const unregReview = reviewResult.rows[0];
            
            // Create entity from the review data
            const entity_id = uuidv4();
            const createEntityQuery = `
                INSERT INTO entities (
                    entity_id, entity_type, name, email, website, 
                    contact_info, description, entity_metadata,
                    verification_status, is_public
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, 'pending', true
                )
                RETURNING *
            `;

            const entityData = [
                entity_id,
                entity_type,
                unregReview.entity_name,
                unregReview.entity_contact_info?.email || `contact@${unregReview.entity_name.toLowerCase().replace(/\s+/g, '')}.com`,
                unregReview.entity_website || 'https://example.com',
                JSON.stringify(unregReview.entity_contact_info || { phone: 'N/A' }),
                unregReview.entity_description || 'Entity created from review submission',
                JSON.stringify({})
            ];

            const entityResult = await client.query(createEntityQuery, entityData);
            const newEntity = entityResult.rows[0];

            // Create the regular review
            const new_review_id = uuidv4();
            const createReviewQuery = `
                INSERT INTO reviews (
                    review_id, entity_id, user_id, reviewer_type, title, overall_rating,
                    review_text, category_ratings, proof_attachments, tags, is_anonymous,
                    review_status, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12, NOW()
                )
                RETURNING *
            `;

            const reviewData = [
                new_review_id, entity_id, unregReview.user_id, unregReview.reviewer_type,
                unregReview.title, unregReview.overall_rating, unregReview.review_text,
                unregReview.category_ratings, unregReview.proof_attachments, unregReview.tags,
                unregReview.is_anonymous, unregReview.created_at
            ];

            const newReviewResult = await client.query(createReviewQuery, reviewData);
            const newReview = newReviewResult.rows[0];

            // Update the unregistered review status
            const updateUnregQuery = `
                UPDATE unregistered_entity_reviews
                SET review_status = 'converted', converted_entity_id = $1, 
                    converted_review_id = $2, updated_at = NOW()
                WHERE review_id = $3
                RETURNING *
            `;

            await client.query(updateUnregQuery, [entity_id, new_review_id, review_id]);

            return {
                entity: newEntity,
                review: newReview,
                original_review: unregReview
            };
        } catch (error) {
            throw error;
        }
    },

    async getUnregisteredReviewStats() {
        try {
            const query = `
                SELECT 
                    review_status,
                    COUNT(*) as count
                FROM unregistered_entity_reviews
                GROUP BY review_status
            `;
            
            const result = await client.query(query);
            return result.rows.reduce((acc, row) => {
                acc[row.review_status] = parseInt(row.count);
                return acc;
            }, {});
        } catch (error) {
            throw error;
        }
    }
}
module.exports = { pool: client, entityModel };