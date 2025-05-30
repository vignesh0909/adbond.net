const client = require('./src/models/db_connection.js').pool;

async function updateOffersTable() {
    try {
        // Add missing columns to offers table
        const alterTableQueries = [
            `ALTER TABLE offers ADD COLUMN IF NOT EXISTS requirements TEXT;`,
            `ALTER TABLE offers ADD COLUMN IF NOT EXISTS allowed_traffic_sources JSONB;`,
            `ALTER TABLE offers ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;`,
            `ALTER TABLE offers ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0;`,
            `ALTER TABLE offers ADD COLUMN IF NOT EXISTS applied_entities JSONB DEFAULT '[]'::jsonb;`
        ];

        for (const query of alterTableQueries) {
            try {
                await client.query(query);
                console.log('Successfully executed:', query);
            } catch (error) {
                if (error.code === '42701') {
                    console.log('Column already exists, skipping:', query);
                } else {
                    console.error('Error executing query:', query, error.message);
                }
            }
        }

        console.log('Offers table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating offers table:', error);
        process.exit(1);
    }
}

updateOffersTable();
