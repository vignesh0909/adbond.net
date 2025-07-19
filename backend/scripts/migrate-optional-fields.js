#!/usr/bin/env node

/**
 * Migration script to make description and category fields optional in offers table
 * This script can be run to update existing database schemas
 */

const { pool } = require('../models/db_connection.js');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('Starting migration: Making description and category optional...');
        
        // Check if the offers table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'offers'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('Offers table does not exist. No migration needed.');
            return;
        }
        
        // Begin transaction
        await client.query('BEGIN');
        
        // Make description nullable
        await client.query(`
            ALTER TABLE offers 
            ALTER COLUMN description DROP NOT NULL;
        `);
        console.log('✓ Made description field optional');
        
        // Add default value for category and make it optional in a way that preserves existing data
        await client.query(`
            ALTER TABLE offers 
            ALTER COLUMN category SET DEFAULT 'NA';
        `);
        console.log('✓ Added default value for category field');
        
        // Update any existing null descriptions to empty string for consistency
        const updateResult = await client.query(`
            UPDATE offers 
            SET description = '' 
            WHERE description IS NULL;
        `);
        console.log(`✓ Updated ${updateResult.rowCount} rows with null descriptions`);
        
        // Update any existing null categories to 'NA'
        const updateCategoryResult = await client.query(`
            UPDATE offers 
            SET category = 'NA' 
            WHERE category IS NULL OR category = '';
        `);
        console.log(`✓ Updated ${updateCategoryResult.rowCount} rows with null/empty categories`);
        
        // Commit transaction
        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
        
    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Run migration if called directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('Migration script completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { runMigration };
