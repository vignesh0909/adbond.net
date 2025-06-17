const { Pool } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    // ssl: {
    //     rejectUnauthorized: false // Temporarily disable SSL verification
    // }
});

// Test the database connection
const pgConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL database connection established successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('Error connecting to PostgreSQL database:', error.message);
        throw error;
    }
};

// Create a client for backwards compatibility with existing model files
const client = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};

module.exports = {
    pool,
    pgConnection,
    client,
    query: (text, params) => pool.query(text, params),
};