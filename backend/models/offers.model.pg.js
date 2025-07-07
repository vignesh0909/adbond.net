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

const createEmailTrackingTableQuery = `
CREATE TABLE IF NOT EXISTS email_tracking (
    email_id TEXT PRIMARY KEY,
    sender_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_entity_id TEXT REFERENCES entities(entity_id) ON DELETE SET NULL,
    recipient_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_entity_id TEXT REFERENCES entities(entity_id) ON DELETE SET NULL,
    offer_request_id TEXT REFERENCES offer_requests(offer_request_id) ON DELETE SET NULL,
    email_type VARCHAR(50) NOT NULL DEFAULT 'contact_request',
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    message_content TEXT,
    email_status VARCHAR(20) DEFAULT 'sent' CHECK (email_status IN ('sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    replied_at TIMESTAMP,
    metadata JSONB
);
-- Indexes for email tracking
    CREATE INDEX IF NOT EXISTS idx_email_tracking_sender_user ON email_tracking(sender_user_id);
    CREATE INDEX IF NOT EXISTS idx_email_tracking_recipient_user ON email_tracking(recipient_user_id);
    CREATE INDEX IF NOT EXISTS idx_email_tracking_offer_request ON email_tracking(offer_request_id);
    CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking(email_type);
    CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON email_tracking(email_status);
    CREATE INDEX IF NOT EXISTS idx_email_tracking_sent_at ON email_tracking(sent_at);
`;

const tables = [
    { name: 'offers', query: createOffersTableQuery },
    { name: 'offer_requests', query: createOfferRequestsTableQuery },
    { name: 'offer_request_bids', query: offerRequestsBidsTableQuery },
    { name: 'email_tracking', query: createEmailTrackingTableQuery },
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
            requirements,
            allowed_traffic_sources
        } = offerData;

        const offer_id = uuidv4();
        
        const query = `
            INSERT INTO offers (
                offer_id, entity_id, title, category, description, target_geo,
                payout_type, payout_value, landing_page_url, offer_status,
                private_offer, requirements, allowed_traffic_sources
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            offer_id, entity_id, title, category, description, JSON.stringify(target_geo),
            payout_type, payout_value, landing_page_url, offer_status,
            private_offer, requirements, allowed_traffic_sources ? JSON.stringify(allowed_traffic_sources) : null
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
        } = requestData;

        const offer_request_id = uuidv4();
        
        const query = `
            INSERT INTO offer_requests (
                offer_request_id, user_id, entity_id, title, vertical,
                geos_targeting, traffic_type, traffic_volume, platforms_used,
                desired_payout_type, budget_range, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const values = [
            offer_request_id, user_id, entity_id, title, vertical,
            JSON.stringify(geos_targeting), JSON.stringify(traffic_type),
            traffic_volume, JSON.stringify(platforms_used),
            desired_payout_type, budget_range ? JSON.stringify(budget_range) : null,
            notes
        ];

        try {
            const result = await client.query(query, values);
            return { success: true, request: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get offer requests
    static async getOfferRequests(user_id, filters = {}, limit = 20, offset = 0) {
        let query = `
            SELECT req.*, e.name as entity_name, e.entity_type, 
                   CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM offer_requests req
            LEFT JOIN entities e ON req.entity_id = e.entity_id
            LEFT JOIN users u ON req.user_id = u.user_id
            WHERE req.request_status = 'active' and u.user_id != $1
        `;
        
        const values = [];
        let paramCount = 0;
        values.push(user_id);
        paramCount++;

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

    // Email tracking methods
    static async trackEmailSent(emailData) {
        const {
            sender_user_id,
            sender_entity_id,
            recipient_user_id,
            recipient_entity_id,
            offer_request_id,
            email_type,
            recipient_email,
            subject,
            message_content,
            metadata
        } = emailData;

        const email_id = uuidv4();
        
        const query = `
            INSERT INTO email_tracking (
                email_id, sender_user_id, sender_entity_id, recipient_user_id,
                recipient_entity_id, offer_request_id, email_type, recipient_email,
                subject, message_content, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            email_id, sender_user_id, sender_entity_id, recipient_user_id,
            recipient_entity_id, offer_request_id, email_type, recipient_email,
            subject, message_content, metadata ? JSON.stringify(metadata) : null
        ];

        try {
            const result = await client.query(query, values);
            return { success: true, email: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async getEmailHistory(filters = {}, limit = 20, offset = 0) {
        let query = `
            SELECT et.*, 
                   CONCAT(su.first_name, ' ', su.last_name) as sender_name,
                   CONCAT(ru.first_name, ' ', ru.last_name) as recipient_name,
                   se.name as sender_entity_name,
                   re.name as recipient_entity_name,
                   req.title as offer_request_title
            FROM email_tracking et
            LEFT JOIN users su ON et.sender_user_id = su.user_id
            LEFT JOIN users ru ON et.recipient_user_id = ru.user_id
            LEFT JOIN entities se ON et.sender_entity_id = se.entity_id
            LEFT JOIN entities re ON et.recipient_entity_id = re.entity_id
            LEFT JOIN offer_requests req ON et.offer_request_id = req.offer_request_id
            WHERE 1=1
        `;
        
        const values = [];
        let paramCount = 0;

        if (filters.sender_user_id) {
            paramCount++;
            query += ` AND et.sender_user_id = $${paramCount}`;
            values.push(filters.sender_user_id);
        }

        if (filters.recipient_user_id) {
            paramCount++;
            query += ` AND et.recipient_user_id = $${paramCount}`;
            values.push(filters.recipient_user_id);
        }

        if (filters.offer_request_id) {
            paramCount++;
            query += ` AND et.offer_request_id = $${paramCount}`;
            values.push(filters.offer_request_id);
        }

        if (filters.email_type) {
            paramCount++;
            query += ` AND et.email_type = $${paramCount}`;
            values.push(filters.email_type);
        }

        query += ` ORDER BY et.sent_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(limit, offset);

        try {
            const result = await client.query(query, values);
            return { success: true, emails: result.rows };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async updateEmailStatus(email_id, status, timestamp_field = null) {
        let query = `UPDATE email_tracking SET email_status = $1`;
        const values = [status];
        let paramCount = 1;

        if (timestamp_field) {
            paramCount++;
            query += `, ${timestamp_field} = $${paramCount}`;
            values.push(new Date());
        }

        paramCount++;
        query += ` WHERE email_id = $${paramCount} RETURNING *`;
        values.push(email_id);

        try {
            const result = await client.query(query, values);
            return { success: true, email: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Update an existing offer
    static async updateOffer(offer_id, offerData, entity_id) {
        const {
            title,
            category,
            description,
            target_geo,
            payout_type,
            payout_value,
            landing_page_url,
            offer_status,
            private_offer,
            requirements,
            allowed_traffic_sources
        } = offerData;

        // Build update query dynamically based on provided fields
        const updateFields = [];
        const values = [];
        let paramCount = 0;

        if (title !== undefined) {
            paramCount++;
            updateFields.push(`title = $${paramCount}`);
            values.push(title);
        }

        if (category !== undefined) {
            paramCount++;
            updateFields.push(`category = $${paramCount}`);
            values.push(category);
        }

        if (description !== undefined) {
            paramCount++;
            updateFields.push(`description = $${paramCount}`);
            values.push(description);
        }

        if (target_geo !== undefined) {
            paramCount++;
            updateFields.push(`target_geo = $${paramCount}`);
            values.push(JSON.stringify(target_geo));
        }

        if (payout_type !== undefined) {
            paramCount++;
            updateFields.push(`payout_type = $${paramCount}`);
            values.push(payout_type);
        }

        if (payout_value !== undefined) {
            paramCount++;
            updateFields.push(`payout_value = $${paramCount}`);
            values.push(payout_value);
        }

        if (landing_page_url !== undefined) {
            paramCount++;
            updateFields.push(`landing_page_url = $${paramCount}`);
            values.push(landing_page_url);
        }

        if (offer_status !== undefined) {
            paramCount++;
            updateFields.push(`offer_status = $${paramCount}`);
            values.push(offer_status);
        }

        if (private_offer !== undefined) {
            paramCount++;
            updateFields.push(`private_offer = $${paramCount}`);
            values.push(private_offer);
        }

        if (requirements !== undefined) {
            paramCount++;
            updateFields.push(`requirements = $${paramCount}`);
            values.push(requirements);
        }

        if (allowed_traffic_sources !== undefined) {
            paramCount++;
            updateFields.push(`allowed_traffic_sources = $${paramCount}`);
            values.push(allowed_traffic_sources ? JSON.stringify(allowed_traffic_sources) : null);
        }

        if (updateFields.length === 0) {
            return { success: false, error: 'No fields to update' };
        }

        // Add updated_at field
        paramCount++;
        updateFields.push(`updated_at = $${paramCount}`);
        values.push(new Date());

        // Add WHERE clause parameters
        paramCount++;
        values.push(offer_id);

        paramCount++;
        values.push(entity_id);

        const query = `
            UPDATE offers 
            SET ${updateFields.join(', ')}
            WHERE offer_id = $${paramCount - 1} AND entity_id = $${paramCount}
            RETURNING *
        `;

        try {
            const result = await client.query(query, values);
            if (result.rows.length === 0) {
                return { success: false, error: 'Offer not found or you do not have permission to update it' };
            }
            return { success: true, offer: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Update an existing offer request
    static async updateOfferRequest(offer_request_id, requestData, user_id) {
        const {
            title,
            vertical,
            geos_targeting,
            traffic_type,
            traffic_volume,
            platforms_used,
            desired_payout_type,
            budget_range,
            notes,
            request_status
        } = requestData;

        // Build update query dynamically based on provided fields
        const updateFields = [];
        const values = [];
        let paramCount = 0;

        if (title !== undefined) {
            paramCount++;
            updateFields.push(`title = $${paramCount}`);
            values.push(title);
        }

        if (vertical !== undefined) {
            paramCount++;
            updateFields.push(`vertical = $${paramCount}`);
            values.push(vertical);
        }

        if (geos_targeting !== undefined) {
            paramCount++;
            updateFields.push(`geos_targeting = $${paramCount}`);
            values.push(JSON.stringify(geos_targeting));
        }

        if (traffic_type !== undefined) {
            paramCount++;
            updateFields.push(`traffic_type = $${paramCount}`);
            values.push(JSON.stringify(traffic_type));
        }

        if (traffic_volume !== undefined) {
            paramCount++;
            updateFields.push(`traffic_volume = $${paramCount}`);
            values.push(traffic_volume);
        }

        if (platforms_used !== undefined) {
            paramCount++;
            updateFields.push(`platforms_used = $${paramCount}`);
            values.push(JSON.stringify(platforms_used));
        }

        if (desired_payout_type !== undefined) {
            paramCount++;
            updateFields.push(`desired_payout_type = $${paramCount}`);
            values.push(desired_payout_type);
        }

        if (budget_range !== undefined) {
            paramCount++;
            updateFields.push(`budget_range = $${paramCount}`);
            values.push(budget_range ? JSON.stringify(budget_range) : null);
        }

        if (notes !== undefined) {
            paramCount++;
            updateFields.push(`notes = $${paramCount}`);
            values.push(notes);
        }

        if (request_status !== undefined) {
            paramCount++;
            updateFields.push(`request_status = $${paramCount}`);
            values.push(request_status);
        }

        if (updateFields.length === 0) {
            return { success: false, error: 'No fields to update' };
        }

        // Add updated_at field
        paramCount++;
        updateFields.push(`updated_at = $${paramCount}`);
        values.push(new Date());

        // Add WHERE clause parameters
        paramCount++;
        values.push(offer_request_id);

        paramCount++;
        values.push(user_id);

        const query = `
            UPDATE offer_requests 
            SET ${updateFields.join(', ')}
            WHERE offer_request_id = $${paramCount - 1} AND user_id = $${paramCount}
            RETURNING *
        `;

        try {
            const result = await client.query(query, values);
            if (result.rows.length === 0) {
                return { success: false, error: 'Offer request not found or you do not have permission to update it' };
            }
            return { success: true, request: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = { OffersModel, client };