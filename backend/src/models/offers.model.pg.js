const client = require('./db_connection.js').pool;
const { v4: uuidv4 } = require('uuid');

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
    requirements TEXT,
    allowed_traffic_sources JSONB,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    applied_entities JSONB DEFAULT '[]'::jsonb,
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
    offer_request_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entity_id TEXT REFERENCES entities(entity_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    vertical VARCHAR(100) NOT NULL,
    geos_targeting JSONB NOT NULL,
    traffic_type JSONB NOT NULL,
    traffic_volume INTEGER NOT NULL,
    platforms_used JSONB NOT NULL,
    desired_payout_type VARCHAR(20) CHECK (desired_payout_type IN ('CPL', 'CPI', 'CPA', 'RevShare')),
    budget_range JSONB,
    notes TEXT,
    request_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (request_status IN ('active', 'fulfilled', 'expired', 'cancelled')),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 -- Indexes for offer requests
    CREATE INDEX IF NOT EXISTS idx_offer_requests_user ON offer_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_offer_requests_entity ON offer_requests(entity_id);
    CREATE INDEX IF NOT EXISTS idx_offer_requests_vertical ON offer_requests(vertical);
    CREATE INDEX IF NOT EXISTS idx_offer_requests_status ON offer_requests(request_status);
`;

const offerRequestsBidsTableQuery = `
CREATE TABLE IF NOT EXISTS offer_request_bids (
    bid_id TEXT PRIMARY KEY,
    offer_request_id TEXT NOT NULL REFERENCES offer_requests(offer_request_id) ON DELETE CASCADE,
    entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bid_amount NUMERIC(12, 2) NOT NULL,
    bid_notes TEXT,
    offer_details JSONB,
    bid_status VARCHAR(20) DEFAULT 'pending' CHECK (bid_status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 -- Indexes for offer request bids
    CREATE INDEX IF NOT EXISTS idx_offer_request_bids_request ON offer_request_bids(offer_request_id);
    CREATE INDEX IF NOT EXISTS idx_offer_request_bids_entity ON offer_request_bids(entity_id);
    CREATE INDEX IF NOT EXISTS idx_offer_request_bids_user ON offer_request_bids(user_id);
    CREATE INDEX IF NOT EXISTS idx_offer_request_bids_status ON offer_request_bids(bid_status);
`;

const createOfferClicksTableQuery = `
CREATE TABLE IF NOT EXISTS offer_clicks (
    click_id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES offers(offer_id) ON DELETE CASCADE,
    clicker_entity_id TEXT REFERENCES entities(entity_id) ON DELETE SET NULL,
    user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    click_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_conversion BOOLEAN DEFAULT FALSE,
    conversion_value NUMERIC(12, 2),
    conversion_timestamp TIMESTAMP
);
 -- Indexes for offer clicks
    CREATE INDEX IF NOT EXISTS idx_offer_clicks_offer ON offer_clicks(offer_id);
    CREATE INDEX IF NOT EXISTS idx_offer_clicks_entity ON offer_clicks(clicker_entity_id);
    CREATE INDEX IF NOT EXISTS idx_offer_clicks_timestamp ON offer_clicks(click_timestamp);
    CREATE INDEX IF NOT EXISTS idx_offer_clicks_conversion ON offer_clicks(is_conversion);
`;

const tables = [
    { name: 'offers', query: createOffersTableQuery },
    { name: 'offer_requests', query: createOfferRequestsTableQuery },
    { name: 'offer_request_bids', query: offerRequestsBidsTableQuery },
    { name: 'offer_clicks', query: createOfferClicksTableQuery }
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

// Offers Model Methods
class OffersModel {
    // Create a new offer
    static async createOffer(offerData) {
        const {
            entity_id,
            title,
            category,
            description,
            target_geo,
            payout_type,
            payout_value,
            landing_page_url,
            offer_status = 'active',
            private_offer = false,
            expires_at,
            requirements,
            allowed_traffic_sources
        } = offerData;

        const offer_id = uuidv4();
        
        const query = `
            INSERT INTO offers (
                offer_id, entity_id, title, category, description, target_geo,
                payout_type, payout_value, landing_page_url, offer_status,
                private_offer, expires_at, requirements, allowed_traffic_sources
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const values = [
            offer_id, entity_id, title, category, description, JSON.stringify(target_geo),
            payout_type, payout_value, landing_page_url, offer_status,
            private_offer, expires_at, requirements, 
            allowed_traffic_sources ? JSON.stringify(allowed_traffic_sources) : null
        ];

        try {
            const result = await client.query(query, values);
            return { success: true, offer: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get offers with filtering
    static async getOffers(filters = {}, limit = 20, offset = 0) {
        let query = `
            SELECT o.*, e.name as entity_name, e.entity_type, e.website
            FROM offers o
            LEFT JOIN entities e ON o.entity_id = e.entity_id
            WHERE o.offer_status = 'active'
        `;
        
        const values = [];
        let paramCount = 0;

        if (filters.category) {
            paramCount++;
            query += ` AND o.category = $${paramCount}`;
            values.push(filters.category);
        }

        if (filters.payout_type) {
            paramCount++;
            query += ` AND o.payout_type = $${paramCount}`;
            values.push(filters.payout_type);
        }

        if (filters.entity_type) {
            paramCount++;
            query += ` AND e.entity_type = $${paramCount}`;
            values.push(filters.entity_type);
        }

        if (filters.min_payout) {
            paramCount++;
            query += ` AND o.payout_value >= $${paramCount}`;
            values.push(filters.min_payout);
        }

        if (filters.max_payout) {
            paramCount++;
            query += ` AND o.payout_value <= $${paramCount}`;
            values.push(filters.max_payout);
        }

        query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        try {
            const result = await client.query(query, values);
            return { success: true, offers: result.rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create offer request
    static async createOfferRequest(requestData) {
        const {
            user_id,
            entity_id,
            title,
            vertical,
            geos_targeting,
            traffic_type,
            traffic_volume,
            platforms_used,
            desired_payout_type,
            budget_range,
            notes,
            expires_at
        } = requestData;

        const offer_request_id = uuidv4();
        
        const query = `
            INSERT INTO offer_requests (
                offer_request_id, user_id, entity_id, title, vertical,
                geos_targeting, traffic_type, traffic_volume, platforms_used,
                desired_payout_type, budget_range, notes, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            offer_request_id, user_id, entity_id, title, vertical,
            JSON.stringify(geos_targeting), JSON.stringify(traffic_type),
            traffic_volume, JSON.stringify(platforms_used),
            desired_payout_type, budget_range ? JSON.stringify(budget_range) : null,
            notes, expires_at
        ];

        try {
            const result = await client.query(query, values);
            return { success: true, request: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get offer requests
    static async getOfferRequests(filters = {}, limit = 20, offset = 0) {
        let query = `
            SELECT req.*, e.name as entity_name, e.entity_type, 
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM offer_requests req
            LEFT JOIN entities e ON req.entity_id = e.entity_id
            LEFT JOIN users u ON req.user_id = u.user_id
            WHERE req.request_status = 'active'
        `;
        
        const values = [];
        let paramCount = 0;

        if (filters.vertical) {
            paramCount++;
            query += ` AND req.vertical = $${paramCount}`;
            values.push(filters.vertical);
        }

        if (filters.desired_payout_type) {
            paramCount++;
            query += ` AND req.desired_payout_type = $${paramCount}`;
            values.push(filters.desired_payout_type);
        }

        if (filters.entity_type) {
            paramCount++;
            query += ` AND e.entity_type = $${paramCount}`;
            values.push(filters.entity_type);
        }

        if (filters.exclude_entity_id) {
            paramCount++;
            query += ` AND (req.entity_id != $${paramCount} OR req.entity_id IS NULL)`;
            values.push(filters.exclude_entity_id);
        }

        query += ` ORDER BY req.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        try {
            const result = await client.query(query, values);
            return { success: true, requests: result.rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Track offer click
    static async trackOfferClick(clickData) {
        const {
            offer_id,
            clicker_entity_id,
            user_id,
            ip_address,
            user_agent,
            referrer_url
        } = clickData;

        const click_id = uuidv4();
        
        const query = `
            INSERT INTO offer_clicks (
                click_id, offer_id, clicker_entity_id, user_id,
                ip_address, user_agent, referrer_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [click_id, offer_id, clicker_entity_id, user_id, ip_address, user_agent, referrer_url];

        try {
            // Insert click record
            const clickResult = await client.query(query, values);
            
            // Update offer click count
            await client.query(
                'UPDATE offers SET click_count = click_count + 1 WHERE offer_id = $1',
                [offer_id]
            );

            return { success: true, click: clickResult.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get offer by ID
    static async getOfferById(offer_id) {
        const query = `
            SELECT o.*, e.name as entity_name, e.entity_type
            FROM offers o
            LEFT JOIN entities e ON o.entity_id = e.entity_id
            WHERE o.offer_id = $1
        `;

        try {
            const result = await client.query(query, [offer_id]);
            if (result.rows.length === 0) {
                return { success: false, error: 'Offer not found' };
            }
            return { success: true, offer: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create bid for offer request
    static async createBid(bidData) {
        const {
            offer_request_id,
            entity_id,
            user_id,
            bid_amount,
            bid_notes,
            offer_details
        } = bidData;

        const bid_id = uuidv4();
        
        const query = `
            INSERT INTO offer_request_bids (
                bid_id, offer_request_id, entity_id, user_id,
                bid_amount, bid_notes, offer_details
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            bid_id, offer_request_id, entity_id, user_id,
            bid_amount, bid_notes, offer_details ? JSON.stringify(offer_details) : null
        ];

        try {
            const result = await client.query(query, values);
            return { success: true, bid: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get bids for an offer request
    static async getBidsForRequest(offer_request_id) {
        const query = `
            SELECT b.*, e.name as entity_name, e.entity_type, 
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM offer_request_bids b
            LEFT JOIN entities e ON b.entity_id = e.entity_id
            LEFT JOIN users u ON b.user_id = u.user_id
            WHERE b.offer_request_id = $1
            ORDER BY b.created_at DESC
        `;

        try {
            const result = await client.query(query, [offer_request_id]);
            return { success: true, bids: result.rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get offers by entity
    static async getOffersByEntity(entity_id, filters = {}, limit = 20, offset = 0) {
        let query = `
            SELECT o.*, e.name as entity_name, e.entity_type
            FROM offers o
            LEFT JOIN entities e ON o.entity_id = e.entity_id
            WHERE o.entity_id = $1
        `;
        
        const values = [entity_id];
        let paramCount = 1;

        if (filters.status) {
            paramCount++;
            query += ` AND o.offer_status = $${paramCount}`;
            values.push(filters.status);
        }

        if (filters.category) {
            paramCount++;
            query += ` AND o.category = $${paramCount}`;
            values.push(filters.category);
        }

        query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        try {
            const result = await client.query(query, values);
            return { success: true, offers: result.rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get offer requests by user
    static async getOfferRequestsByUser(user_id, filters = {}, limit = 20, offset = 0) {
        let query = `
            SELECT req.*, e.name as entity_name, e.entity_type, 
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM offer_requests req
            LEFT JOIN entities e ON req.entity_id = e.entity_id
            LEFT JOIN users u ON req.user_id = u.user_id
            WHERE req.user_id = $1
        `;
        
        const values = [user_id];
        let paramCount = 1;

        if (filters.status) {
            paramCount++;
            query += ` AND req.request_status = $${paramCount}`;
            values.push(filters.status);
        }

        if (filters.vertical) {
            paramCount++;
            query += ` AND req.vertical = $${paramCount}`;
            values.push(filters.vertical);
        }

        query += ` ORDER BY req.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        try {
            const result = await client.query(query, values);
            return { success: true, requests: result.rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = { OffersModel, client };