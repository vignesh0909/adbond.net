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
    verification_data JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMP,
    password_reset_required BOOLEAN DEFAULT FALSE,
    temp_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}';

-- Migrate existing data to new JSONB column if old columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'linkedin_profile') THEN
        UPDATE users 
        SET verification_data = CASE 
            WHEN identity_verified = TRUE THEN 
                CASE verification_method
                    WHEN 'linkedin' THEN jsonb_build_object(
                        'identity_verified', TRUE,
                        'verification_method', 'linkedin',
                        'linkedin_profile', COALESCE(linkedin_profile, ''),
                        'verification_date', verification_date::text
                    )
                    WHEN 'business_email' THEN jsonb_build_object(
                        'identity_verified', TRUE,
                        'verification_method', 'business_email',
                        'business_email', email,
                        'verification_date', verification_date::text
                    )
                    ELSE jsonb_build_object('identity_verified', FALSE)
                END
            ELSE jsonb_build_object('identity_verified', FALSE)
        END
        WHERE verification_data = '{}' OR verification_data IS NULL;
        
        -- Drop old columns after migration
        ALTER TABLE users DROP COLUMN IF EXISTS linkedin_profile;
        ALTER TABLE users DROP COLUMN IF EXISTS identity_verified;
        ALTER TABLE users DROP COLUMN IF EXISTS verification_method;
        ALTER TABLE users DROP COLUMN IF EXISTS verification_date;
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification_data ON users USING GIN(verification_data);
CREATE INDEX IF NOT EXISTS idx_users_email_verification ON users(email_verification_token);
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
            const { first_name, last_name, email, password, role = 'user', entity_id = null, password_reset_required = false,
                temp_password_expires = null, email_verified = false } = userData;
            const user_id = uuidv4();

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const query = `
                INSERT INTO users (
                    user_id, entity_id, first_name, last_name, email, password, role,
                    password_reset_required, temp_password_expires, email_verified
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING user_id, entity_id, first_name, last_name, email, role, status, 
                         password_reset_required, email_verified, created_at
            `;

            const values = [
                user_id, entity_id, first_name, last_name, email, hashedPassword, role,
                password_reset_required, temp_password_expires, email_verified
            ];
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
            const user = result.rows[0];

            if (!user) {
                return null;
            }

            // Extract verification data for backward compatibility
            const verificationData = user.verification_data || {};
            return {
                ...user,
                identity_verified: verificationData.identity_verified || false,
                verification_method: verificationData.verification_method || null,
                linkedin_profile: verificationData.linkedin_profile || null,
                business_email: verificationData.business_email || null
            };
        } catch (error) {
            throw error;
        }
    },

    // Get user by ID
    async getUserById(user_id) {
        try {
            const query = `
                SELECT user_id, entity_id, first_name, last_name, email, role, status, 
                       profile_image_url, verification_data, email_verified,
                       password_reset_required, last_login, created_at, updated_at
                FROM users 
                WHERE user_id = $1
            `;
            const result = await client.query(query, [user_id]);
            const user = result.rows[0];

            if (!user) {
                return null;
            }

            // Extract verification data for backward compatibility
            const verificationData = user.verification_data || {};
            return {
                ...user,
                identity_verified: verificationData.identity_verified || false,
                verification_method: verificationData.verification_method || null,
                linkedin_profile: verificationData.linkedin_profile || null,
                business_email: verificationData.business_email || null
            };
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

    // Update password
    async updatePassword(user_id, newPassword) {
        try {
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            const query = `
                UPDATE users 
                SET password = $2,
                    password_reset_required = FALSE,
                    temp_password_expires = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING user_id, email
            `;

            const result = await client.query(query, [user_id, hashedPassword]);
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
    },

    // Check if temporary password has expired
    async checkTempPasswordExpiry(user_id) {
        try {
            const query = `
                SELECT password_reset_required, temp_password_expires 
                FROM users 
                WHERE user_id = $1
            `;
            const result = await client.query(query, [user_id]);
            const user = result.rows[0];

            if (!user || !user.password_reset_required) {
                return { expired: false, requires_reset: false };
            }

            if (!user.temp_password_expires) {
                return { expired: false, requires_reset: true };
            }

            const now = new Date();
            const expiryDate = new Date(user.temp_password_expires);

            return {
                expired: now > expiryDate,
                requires_reset: user.password_reset_required,
                expiry_date: user.temp_password_expires
            };
        } catch (error) {
            throw error;
        }
    },

    // Generate email verification token
    async generateEmailVerificationToken(user_id) {
        try {
            const token = uuidv4();
            const expires = new Date();
            expires.setHours(expires.getHours() + 24); // 24 hours expiry

            const query = `
                UPDATE users 
                SET email_verification_token = $1,
                    email_verification_expires = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $3
                RETURNING email, first_name, last_name
            `;

            const result = await client.query(query, [token, expires, user_id]);
            return { ...result.rows[0], token };
        } catch (error) {
            throw error;
        }
    },

    // Verify email token
    async verifyEmailToken(token) {
        try {
            const query = `
                SELECT user_id, email, email_verification_expires
                FROM users 
                WHERE email_verification_token = $1
            `;
            const result = await client.query(query, [token]);
            const user = result.rows[0];

            if (!user) {
                return { valid: false, message: 'Invalid verification token' };
            }

            const now = new Date();
            const expiryDate = new Date(user.email_verification_expires);

            if (now > expiryDate) {
                return { valid: false, message: 'Verification token has expired' };
            }

            // Mark email as verified
            const updateQuery = `
                UPDATE users 
                SET email_verified = TRUE,
                    email_verification_token = NULL,
                    email_verification_expires = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING user_id, email, first_name, last_name
            `;

            const updateResult = await client.query(updateQuery, [user.user_id]);
            return { valid: true, user: updateResult.rows[0] };
        } catch (error) {
            throw error;
        }
    },

    // Update identity verification
    async updateIdentityVerification(user_id, verification_method, verification_data) {
        try {
            const verificationRecord = {
                identity_verified: true,
                verification_method,
                verification_date: new Date().toISOString(),
                ...verification_data
            };

            const query = `
                UPDATE users 
                SET verification_data = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING user_id, email, verification_data
            `;

            const result = await client.query(query, [user_id, JSON.stringify(verificationRecord)]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Check user verification status
    async getUserVerificationStatus(user_id) {
        try {
            const query = `
                SELECT 
                    email_verified, 
                    verification_data,
                    entity_id
                FROM users WHERE user_id = $1
            `;
            const result = await client.query(query, [user_id]);
            const user = result.rows[0];

            if (!user) {
                return null;
            }

            // Extract verification status from JSONB
            const verificationData = user.verification_data || {};
            return {
                email_verified: user.email_verified,
                identity_verified: verificationData.identity_verified || false,
                verification_method: verificationData.verification_method || null,
                verification_date: verificationData.verification_date || null,
                linkedin_profile: verificationData.linkedin_profile || null,
                business_email: verificationData.business_email || null,
                entity_id: user.entity_id
            };
        } catch (error) {
            throw error;
        }
    },
};

module.exports = { pool: client, userModel };