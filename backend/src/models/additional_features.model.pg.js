const client = require('./db_connection.js').pool;

// Watchlists & Alerts
const createWatchlistsTableQuery = `
CREATE TABLE IF NOT EXISTS watchlists (
    watchlist_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
    alert_preferences JSONB DEFAULT '{"status_changes": true, "new_reviews": true, "offer_updates": true}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_entity ON watchlists(entity_id);
`;

// Trust Badges
// const createTrustBadgesTableQuery = `
// CREATE TABLE IF NOT EXISTS trust_badges (
//     badge_id SERIAL PRIMARY KEY,
//     badge_name VARCHAR(100) NOT NULL UNIQUE,
//     badge_description TEXT NOT NULL,
//     badge_icon_url VARCHAR(500),
//     criteria JSONB NOT NULL,
//     badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('payment', 'quality', 'volume', 'reliability', 'special')),
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// -- Entity Trust Badges (Many-to-Many)
// CREATE TABLE IF NOT EXISTS entity_trust_badges (
//     entity_id INTEGER NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
//     badge_id INTEGER NOT NULL REFERENCES trust_badges(badge_id) ON DELETE CASCADE,
//     earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     verified_by INTEGER REFERENCES users(user_id),
//     expiry_date TIMESTAMP,
//     is_active BOOLEAN DEFAULT TRUE,
//     PRIMARY KEY (entity_id, badge_id)
// );

// CREATE INDEX IF NOT EXISTS idx_entity_badges_entity ON entity_trust_badges(entity_id);
// CREATE INDEX IF NOT EXISTS idx_entity_badges_active ON entity_trust_badges(is_active);
// `;

// Fraud Reports & Blacklist
// const createFraudReportsTableQuery = `
// CREATE TABLE IF NOT EXISTS fraud_reports (
//     report_id SERIAL PRIMARY KEY,
//     reported_entity_id INTEGER NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
//     reporter_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('payment_fraud', 'traffic_fraud', 'bot_traffic', 'cloaking', 'policy_violation', 'other')),
//     report_title VARCHAR(200) NOT NULL,
//     report_description TEXT NOT NULL,
//     evidence_urls JSONB DEFAULT '[]'::jsonb,
//     financial_loss_amount NUMERIC(12, 2),
//     affected_campaigns JSONB,
//     severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
//     report_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (report_status IN ('pending', 'investigating', 'verified', 'dismissed', 'resolved')),
//     admin_notes TEXT,
//     investigated_by INTEGER REFERENCES users(user_id),
//     resolution_notes TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_fraud_reports_entity ON fraud_reports(reported_entity_id);
// CREATE INDEX IF NOT EXISTS idx_fraud_reports_reporter ON fraud_reports(reporter_user_id);
// CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON fraud_reports(report_status);
// CREATE INDEX IF NOT EXISTS idx_fraud_reports_severity ON fraud_reports(severity);
// `;

// Blacklist
// const createBlacklistTableQuery = `
// CREATE TABLE IF NOT EXISTS blacklist (
//     blacklist_id SERIAL PRIMARY KEY,
//     entity_id INTEGER NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
//     blacklist_type VARCHAR(50) NOT NULL CHECK (blacklist_type IN ('fraud', 'policy_violation', 'payment_issues', 'quality_issues', 'manual')),
//     reason TEXT NOT NULL,
//     evidence_report_ids INTEGER[] DEFAULT '{}',
//     blacklisted_by INTEGER NOT NULL REFERENCES users(user_id),
//     severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'permanent')),
//     is_active BOOLEAN DEFAULT TRUE,
//     expires_at TIMESTAMP,
//     appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')),
//     appeal_notes TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_blacklist_entity ON blacklist(entity_id);
// CREATE INDEX IF NOT EXISTS idx_blacklist_active ON blacklist(is_active);
// CREATE INDEX IF NOT EXISTS idx_blacklist_severity ON blacklist(severity);
// `;

// // API Access Tracking
// const createApiAccessTableQuery = `
// CREATE TABLE IF NOT EXISTS api_access (
//     access_id SERIAL PRIMARY KEY,
//     user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     api_key VARCHAR(255) NOT NULL UNIQUE,
//     access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('basic', 'premium', 'enterprise')),
//     permissions JSONB NOT NULL DEFAULT '{"read_offers": true, "read_reviews": false, "write_access": false}'::jsonb,
//     rate_limit_per_hour INTEGER DEFAULT 1000,
//     monthly_quota INTEGER DEFAULT 10000,
//     usage_count_month INTEGER DEFAULT 0,
//     last_used TIMESTAMP,
//     is_active BOOLEAN DEFAULT TRUE,
//     expires_at TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_api_access_user ON api_access(user_id);
// CREATE INDEX IF NOT EXISTS idx_api_access_key ON api_access(api_key);
// CREATE INDEX IF NOT EXISTS idx_api_access_active ON api_access(is_active);
// `;

// Notifications System
const createNotificationsTableQuery = `
CREATE TABLE IF NOT EXISTS notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('watchlist_alert', 'review_reply', 'offer_match', 'system_update', 'fraud_alert')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_entity_id TEXT REFERENCES entities(entity_id),
    related_offer_id TEXT REFERENCES offers(offer_id),
    related_review_id TEXT REFERENCES reviews(review_id),
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
`;

// Admin Activity Log
const createAdminActivityLogTableQuery = `
CREATE TABLE IF NOT EXISTS admin_activity_log (
    log_id TEXT PRIMARY KEY,
    admin_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('user', 'entity', 'offer', 'review', 'report', 'system')),
    target_id INTEGER,
    action_details JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_log_admin ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_action ON admin_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_log_target ON admin_activity_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_created ON admin_activity_log(created_at);
`;

const tables = [
    { name: 'watchlists', query: createWatchlistsTableQuery },
    // { name: 'trust_badges', query: createTrustBadgesTableQuery },
    // { name: 'fraud_reports', query: createFraudReportsTableQuery },
    // { name: 'blacklist', query: createBlacklistTableQuery },
    // { name: 'api_access', query: createApiAccessTableQuery },
    { name: 'notifications', query: createNotificationsTableQuery },
    { name: 'admin_activity_log', query: createAdminActivityLogTableQuery }
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