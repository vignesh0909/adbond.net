const client = require('./db_connection.js').pool;

const createEntitysTableQuery = `
CREATE TABLE IF NOT EXISTS entities (
    entity_id TEXT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('advertiser', 'network', 'affiliate')),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    website_url VARCHAR(500) NOT NULL,
    contact_info JSONB NOT NULL,
    image_url VARCHAR(500),
    description TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('approved', 'rejected', 'on_hold')),
    entity_metadata JSONB NOT NULL,
    additional_request TEXT,
    flag_history JSONB,
    reputation_score DECIMAL(3,2) DEFAULT 0.00 CHECK (reputation_score >= 0 AND reputation_score <= 5),
    total_reviews INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        entity_metadata ? 'available_offer_count' AND
        entity_metadata ? 'top_verticals' AND
        entity_metadata ? 'commission_type' AND
        entity_metadata ? 'minimum_payment' AND
        entity_metadata ? 'payment_frequency' AND
        entity_metadata ? 'payment_method' AND
        entity_metadata ? 'referral_commission' AND
        entity_metadata ? 'tracking_software'
    ),
    CHECK (
        contact_info ? 'phone' OR
        contact_info ? 'telegram' OR
        contact_info ? 'skype'
    )
);

-- Indexes for entities
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_reputation ON entities(reputation_score);
CREATE INDEX IF NOT EXISTS idx_entities_public ON entities(is_public);
`;


const createOffersTableQuery = `CREATE TABLE IF NOT EXISTS offers (
    offer_id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    target_geo JSONB NOT NULL,
    payout_type VARCHAR(20) CHECK (payout_type IN ('CPA', 'CPL', 'CPI', 'RevShare')) NOT NULL,
    payout_value NUMERIC(12, 2) NOT NULL,
    landing_page_url VARCHAR(500) NOT NULL,
    offer_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (offer_status IN ('active', 'paused', 'expired', 'draft')),
    approval_required BOOLEAN DEFAULT FALSE,
    private_offer BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 -- Indexes for offers
    CREATE INDEX IF NOT EXISTS idx_offers_entity ON offers(entity_id);
    CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(offer_status);
    CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category);
    CREATE INDEX IF NOT EXISTS idx_offers_payout_type ON offers(payout_type);
    CREATE INDEX IF NOT EXISTS idx_offers_created ON offers(created_at);
`;

const createOfferRequestsTableQuery = `
CREATE TABLE IF NOT EXISTS offer_requests (
    request_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entity_id TEXT REFERENCES entities(entity_id) ON DELETE SET NULL,
    vertical VARCHAR(100) NOT NULL,
    geos_targeting JSONB NOT NULL,
    traffic_type JSONB NOT NULL,
    traffic_volume INTEGER NOT NULL,
    platforms_used JSONB NOT NULL,
    desired_payout_type VARCHAR(20) CHECK (desired_payout_type IN ('CPL', 'CPI', 'CPA', 'RevShare')),
    notes TEXT,
    request_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (request_status IN ('active', 'fulfilled', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 -- Indexes for offer requests
    CREATE INDEX IF NOT EXISTS idx_offer_requests_user ON offer_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_offer_requests_vertical ON offer_requests(vertical);
    CREATE INDEX IF NOT EXISTS idx_offer_requests_status ON offer_requests(request_status);
    CREATE INDEX IF NOT EXISTS idx_offer_requests_visibility ON offer_requests(visibility);
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
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_user_id);
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

const tables = [
    { name: 'entities', query: createEntitysTableQuery },
    { name: 'offers', query: createOffersTableQuery },
    { name: 'offer_requests', query: createOfferRequestsTableQuery },
    { name: 'reviews', query: createReviewsTableQuery },
    { name: 'review_replies', query: createReviewRepliesTableQuery },
    { name: 'access_requests', query: createAccessRequestsTableQuery }
];

tables.forEach(table => {
    client.query(table.query, (err, res) => {
        if (err) {
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

module.exports = client;