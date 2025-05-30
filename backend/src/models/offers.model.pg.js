const client = require('./db_connection.js').pool;

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
    private_offer BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    applied_entitites JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    CHECK (
        applied_entitites ? 'name' AND
        applied_entitites ? 'applied_at'
    )
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
    offer_request_id TEXT PRIMARY KEY,
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
`;

const offerRequestsBidsTableQuery = `
CREATE TABLE IF NOT EXISTS offer_request_bids (
    bid_id TEXT PRIMARY KEY,
    offer_request_id TEXT NOT NULL REFERENCES offer_requests(offer_request_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bid_amount NUMERIC(12, 2) NOT NULL,
    bid_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 -- Indexes for offer request bids
    CREATE INDEX IF NOT EXISTS idx_offer_request_bids_request ON offer_request_bids(offer_request_id);
    CREATE INDEX IF NOT EXISTS idx_offer_request_bids_user ON offer_request_bids(user_id);
`;

const tables = [
    { name: 'offers', query: createOffersTableQuery },
    { name: 'offer_requests', query: createOfferRequestsTableQuery },
    { name: 'offer_request_bids', query: offerRequestsBidsTableQuery }
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