const client = require('./db_connection').pool;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    entity_id TEXT REFERENCES entities(entity_id) ON DELETE SET NULL,
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

// User model methods
const userModel = {
    // Create a new user
    async createUser(userData) {
        try {
            const { first_name, last_name, email, password, role = 'user' } = userData;
            const user_id = uuidv4();
            
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const query = `
                INSERT INTO users (user_id, first_name, last_name, email, password, role)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING user_id, first_name, last_name, email, role, status, created_at
            `;
            
            const values = [user_id, first_name, last_name, email, hashedPassword, role];
            const result = await client.query(query, values);
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Get user by email
    async getUserByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await client.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Get user by ID
    async getUserById(user_id) {
        try {
            const query = `
                SELECT user_id, first_name, last_name, email, role, status, 
                       profile_image_url, linkedin_profile, identity_verified, 
                       last_login, created_at, updated_at
                FROM users 
                WHERE user_id = $1
            `;
            const result = await client.query(query, [user_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw error;
        }
    },

    // Update last login
    async updateLastLogin(user_id) {
        try {
            const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1';
            await client.query(query, [user_id]);
        } catch (error) {
            throw error;
        }
    },

    // Get all users (without password)
    async getAllUsers() {
        try {
            const query = `
                SELECT user_id, first_name, last_name, email, role, status, 
                       profile_image_url, linkedin_profile, identity_verified, 
                       last_login, created_at, updated_at
                FROM users 
                ORDER BY created_at DESC
            `;
            const result = await client.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Update user
    async updateUser(user_id, userData) {
        try {
            const { first_name, last_name, email, profile_image_url, linkedin_profile } = userData;
            
            const query = `
                UPDATE users 
                SET first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    email = COALESCE($4, email),
                    profile_image_url = COALESCE($5, profile_image_url),
                    linkedin_profile = COALESCE($6, linkedin_profile),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING user_id, first_name, last_name, email, role, status, 
                         profile_image_url, linkedin_profile, identity_verified, 
                         last_login, created_at, updated_at
            `;
            
            const values = [user_id, first_name, last_name, email, profile_image_url, linkedin_profile];
            const result = await client.query(query, values);
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Delete user
    async deleteUser(user_id) {
        try {
            const query = 'DELETE FROM users WHERE user_id = $1';
            await client.query(query, [user_id]);
        } catch (error) {
            throw error;
        }
    }
};

module.exports = { pool: client, userModel };