const client = require('./db_connection.js').pool;

// const createDaoVotesTableQuery = `
// CREATE TABLE IF NOT EXISTS dao_votes (
//     vote_id SERIAL PRIMARY KEY,
//     proposal_id INTEGER NOT NULL REFERENCES dao_governance(proposal_id) ON DELETE CASCADE,
//     voter_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     vote_option VARCHAR(50) NOT NULL,
//     voting_power INTEGER DEFAULT 1,
//     wallet_address VARCHAR(100),
//     vote_proof_hash VARCHAR(100),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     UNIQUE(proposal_id, voter_user_id)
// );

// CREATE INDEX IF NOT EXISTS idx_dao_votes_proposal ON dao_votes(proposal_id);
// CREATE INDEX IF NOT EXISTS idx_dao_votes_voter ON dao_votes(voter_user_id);
// `;

// User Sessions & Security
// const createUserSessionsTableQuery = `
// CREATE TABLE IF NOT EXISTS user_sessions (
//     session_id VARCHAR(255) PRIMARY KEY,
//     user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     ip_address INET,
//     user_agent TEXT,
//     is_active BOOLEAN DEFAULT TRUE,
//     expires_at TIMESTAMP NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
// CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
// CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
// `;

// System Settings & Configuration
// const createSystemSettingsTableQuery = `
// CREATE TABLE IF NOT EXISTS system_settings (
//     setting_id SERIAL PRIMARY KEY,
//     setting_key VARCHAR(100) NOT NULL UNIQUE,
//     setting_value JSONB NOT NULL,
//     setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
//     description TEXT,
//     is_public BOOLEAN DEFAULT FALSE,
//     updated_by INTEGER REFERENCES users(user_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
// CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(is_public);
// `;

// Analytics & Metrics
// const createAnalyticsTableQuery = `
// CREATE TABLE IF NOT EXISTS analytics_events (
//     event_id SERIAL PRIMARY KEY,
//     user_id INTEGER REFERENCES users(user_id),
//     event_type VARCHAR(100) NOT NULL,
//     event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('user_action', 'system_event', 'business_metric', 'security_event')),
//     event_data JSONB NOT NULL,
//     session_id VARCHAR(255),
//     ip_address INET,
//     user_agent TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
// CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
// CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events(event_category);
// CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
// `;

// Email Templates & Communications
// const createEmailTemplatesTableQuery = `
// CREATE TABLE IF NOT EXISTS email_templates (
//     template_id SERIAL PRIMARY KEY,
//     template_name VARCHAR(100) NOT NULL UNIQUE,
//     template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('welcome', 'verification', 'notification', 'marketing', 'system')),
//     subject_line VARCHAR(200) NOT NULL,
//     template_body TEXT NOT NULL,
//     template_variables JSONB DEFAULT '[]'::jsonb,
//     is_active BOOLEAN DEFAULT TRUE,
//     created_by INTEGER REFERENCES users(user_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
// CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
// `;

// const createEmailQueueTableQuery = `
// CREATE TABLE IF NOT EXISTS email_queue (
//     queue_id SERIAL PRIMARY KEY,
//     recipient_user_id INTEGER REFERENCES users(user_id),
//     recipient_email VARCHAR(255) NOT NULL,
//     template_id INTEGER REFERENCES email_templates(template_id),
//     email_subject VARCHAR(200) NOT NULL,
//     email_body TEXT NOT NULL,
//     template_data JSONB,
//     priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
//     queue_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (queue_status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
//     attempts INTEGER DEFAULT 0,
//     max_attempts INTEGER DEFAULT 3,
//     error_message TEXT,
//     scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     sent_at TIMESTAMP,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(queue_status);
// CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
// CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_queue(recipient_user_id);
// `;

// File Uploads & Media Management
const createFileUploadsTableQuery = `
CREATE TABLE IF NOT EXISTS file_uploads (
    file_id SERIAL PRIMARY KEY,
    uploaded_by TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_category VARCHAR(50) CHECK (file_category IN ('profile_image', 'review_proof', 'fraud_evidence', 'offer_media', 'other')),
    related_entity_type VARCHAR(50) CHECK (related_entity_type IN ('user', 'entity', 'offer', 'review', 'report')),
    related_entity_id TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    virus_scan_status VARCHAR(20) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
    upload_status VARCHAR(20) DEFAULT 'completed' CHECK (upload_status IN ('uploading', 'completed', 'failed', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploads_user ON file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_uploads_category ON file_uploads(file_category);
CREATE INDEX IF NOT EXISTS idx_uploads_related ON file_uploads(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON file_uploads(upload_status);
`;

// Future Web3/DAO Features
// const createDaoGovernanceTableQuery = `
// CREATE TABLE IF NOT EXISTS dao_governance (
//     proposal_id SERIAL PRIMARY KEY,
//     proposer_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
//     proposal_type VARCHAR(50) NOT NULL CHECK (proposal_type IN ('dispute_resolution', 'platform_update', 'policy_change', 'entity_verification', 'blacklist_appeal')),
//     proposal_title VARCHAR(200) NOT NULL,
//     proposal_description TEXT NOT NULL,
//     target_entity_id INTEGER REFERENCES entities(entity_id),
//     target_review_id INTEGER REFERENCES reviews(review_id),
//     target_report_id INTEGER REFERENCES fraud_reports(report_id),
//     voting_options JSONB NOT NULL DEFAULT '["approve", "reject"]'::jsonb,
//     voting_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     voting_end_date TIMESTAMP NOT NULL,
//     minimum_votes_required INTEGER DEFAULT 100,
//     proposal_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (proposal_status IN ('active', 'passed', 'rejected', 'cancelled', 'expired')),
//     execution_status VARCHAR(20) DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executed', 'failed')),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE INDEX IF NOT EXISTS idx_dao_proposals_proposer ON dao_governance(proposer_user_id);
// CREATE INDEX IF NOT EXISTS idx_dao_proposals_status ON dao_governance(proposal_status);
// CREATE INDEX IF NOT EXISTS idx_dao_proposals_type ON dao_governance(proposal_type);
// `;

const tables = [
    // { name: 'dao_governance', query: createDaoGovernanceTableQuery },
    // { name: 'dao_votes', query: createDaoVotesTableQuery },
    // { name: 'user_sessions', query: createUserSessionsTableQuery },
    // { name: 'system_settings', query: createSystemSettingsTableQuery },
    // { name: 'analytics_events', query: createAnalyticsTableQuery },
    // { name: 'email_templates', query: createEmailTemplatesTableQuery },
    // { name: 'email_queue', query: createEmailQueueTableQuery },
    { name: 'file_uploads', query: createFileUploadsTableQuery }
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