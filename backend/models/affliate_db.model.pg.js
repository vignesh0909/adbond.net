const client = require('./db_connection.js').pool;
const { v4: uuidv4 } = require('uuid');

const createAffliateTableQuery = `
CREATE TABLE IF NOT EXISTS affliates (
    affliate_id TEXT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(500),
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for affliates
CREATE INDEX IF NOT EXISTS idx_companies_name ON affliates(company_name);
`;

const createAffEmployeesTableQuery = `
CREATE TABLE IF NOT EXISTS affliate_contacts (
    contact_id TEXT PRIMARY KEY,
    affliate_id TEXT NOT NULL REFERENCES affliates(affliate_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    designation VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for affliate_contacts
CREATE INDEX IF NOT EXISTS idx_employees_company ON affliate_contacts(affliate_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON affliate_contacts(email);
CREATE INDEX IF NOT EXISTS idx_employees_name ON affliate_contacts(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_employees_designation ON affliate_contacts(designation);
`;

// Execute table creation queries
const createTables = async () => {
    try {
        await client.query(createAffliateTableQuery);
        console.log('Companies table created successfully');

        await client.query(createAffEmployeesTableQuery);
        console.log('Employees table created successfully');
    } catch (error) {
        console.error('Error creating tables:', error.message);
        throw error;
    }
};

// Company model methods
const companyModel = {
    // Create a new company
    async createCompany(companyData) {
        const { company_name, website, description, logo_url } = companyData;

        const affliate_id = uuidv4();

        const query = `
            INSERT INTO affliates (
                affliate_id, company_name, website, description, logo_url
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [
            affliate_id, company_name, website, description, logo_url
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    },

    // Get company by ID
    async getCompanyById(affliate_id) {
        const query = 'SELECT * FROM affliates WHERE affliate_id = $1';
        const result = await client.query(query, [affliate_id]);
        return result.rows[0];
    },

    // Get company by name
    async getCompanyByName(company_name) {
        const query = 'SELECT * FROM affliates WHERE company_name ILIKE $1';
        const result = await client.query(query, [`%${company_name}%`]);
        return result.rows[0];
    },

    // Search affliates
    async searchCompanies(searchTerm, limit = 50, offset = 0) {
        const query = `
            SELECT * FROM affliates 
            WHERE company_name ILIKE $1 OR website ILIKE $1 OR description ILIKE $1
            ORDER BY company_name
            LIMIT $2 OFFSET $3
        `;
        const result = await client.query(query, [`%${searchTerm}%`, limit, offset]);
        return result.rows;
    },

    // Get all affliates with employee count (with pagination)
    async getAllCompaniesWithStats(limit = 20, offset = 0) {
        const query = `
            SELECT 
                c.*,
                COUNT(e.contact_id) as employee_count
            FROM affliates c
            LEFT JOIN affliate_contacts e ON c.affliate_id = e.affliate_id
            GROUP BY c.affliate_id
            ORDER BY c.company_name
            LIMIT $1 OFFSET $2
        `;
        const result = await client.query(query, [limit, offset]);
        return result.rows;
    },

    // Get total count of companies
    async getTotalCompaniesCount() {
        const query = 'SELECT COUNT(*) as total FROM affliates';
        const result = await client.query(query);
        return parseInt(result.rows[0].total);
    },

    // Get total count of companies matching search
    async getSearchCompaniesCount(searchTerm) {
        const query = `
            SELECT COUNT(*) as total FROM affliates 
            WHERE company_name ILIKE $1 OR website ILIKE $1 OR description ILIKE $1
        `;
        const result = await client.query(query, [`%${searchTerm}%`]);
        return parseInt(result.rows[0].total);
    }
};

// Employee model methods
const employeeModel = {
    // Create a new employee
    async createEmployee(employeeData) {
        const { affliate_id, first_name, last_name, designation, email, phone } = employeeData;

        const contact_id = uuidv4();

        const query = `
            INSERT INTO affliate_contacts (
                contact_id, affliate_id, first_name, last_name, designation, email, phone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            contact_id, affliate_id, first_name, last_name, designation, email, phone
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    },

    // Get affliate_contacts by company (with access control)
    async getEmployeesByCompany(affliate_id, user_has_access = false) {
        const query = user_has_access ? `
            SELECT contact_id, affliate_id, first_name, last_name, full_name, designation, email, phone,
                created_at, updated_at
            FROM affliate_contacts 
            WHERE affliate_id = $1
            ORDER BY designation, last_name, first_name
        ` : `
            SELECT contact_id, affliate_id, first_name, last_name, full_name, designation, created_at, updated_at
            FROM affliate_contacts 
            WHERE affliate_id = $1
            ORDER BY designation, last_name, first_name
        `;

        const result = await client.query(query, [affliate_id]);
        return result.rows;
    },

    // Search affliate_contacts
    async searchEmployees(searchTerm, affliate_id = null, user_has_access = false) {
        let query = user_has_access ? `
            SELECT e.contact_id, e.affliate_id, e.first_name, e.last_name, e.full_name, e.designation, e.email,
                e.phone, c.company_name
            FROM affliate_contacts e
            JOIN affliates c ON e.affliate_id = c.affliate_id
            WHERE (e.first_name ILIKE $1 OR e.last_name ILIKE $1 OR e.designation ILIKE $1)
        ` : `
            SELECT e.contact_id, e.affliate_id, e.first_name, e.last_name, e.full_name, e.designation, c.company_name
            FROM affliate_contacts e
            JOIN affliates c ON e.affliate_id = c.affliate_id
            WHERE (e.first_name ILIKE $1 OR e.last_name ILIKE $1 OR e.designation ILIKE $1)
        `;

        const params = [`%${searchTerm}%`];

        if (affliate_id) {
            query += ' AND e.affliate_id = $2';
            params.push(affliate_id);
        }

        query += ' ORDER BY e.full_name';

        const result = await client.query(query, params);
        return result.rows;
    }
};

// Initialize tables
createTables();

module.exports = { companyModel, employeeModel };
