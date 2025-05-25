const client = require('./db_connection').pool;

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'advertiser', 'affiliate', 'network', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    profile_image_url VARCHAR(500),
    linkedin_profile VARCHAR(500),
    identity_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50) CHECK (verification_method IN ('linkedin', 'business_email')),
    verification_date TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(identity_verified);
`;

client.query(createUsersTableQuery, (err, res) => {
    if (err) {
        if (err.code === '42P07') {
            console.log('Table "users" already exists');
        } else {
            console.log('Error creating users table:', err.message);
        }
        return;
    }
    console.log('Users table created successfully');
});

module.exports = client;