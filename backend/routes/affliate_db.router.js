const express = require('express');
const router = express.Router();
const { companyModel, employeeModel } = require('../models/affliate_db.model.pg.js');
const { userModel } = require('../models/user.model.pg.js');
const { authenticateToken } = require('../middleware/auth');
const { validationResult, query } = require('express-validator');

// Get all companies with basic info (public access for authenticated users)
router.get('/fetch', authenticateToken, [
    query('search').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let companies;
        let totalCount;

        if (search) {
            companies = await companyModel.searchCompanies(search, limit, offset);
            totalCount = await companyModel.getSearchCompaniesCount(search);
        } else {
            companies = await companyModel.getAllCompaniesWithStats(limit, offset);
            totalCount = await companyModel.getTotalCompaniesCount();
        }

        // Add company type and geo information
        const enrichedCompanies = companies.map(company => ({
            ...company,
            entity_type: 'Affiliate', // Default type for now
            website: company.website || 'N/A'
        }));

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: enrichedCompanies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific company details
router.get('/:affliate_id', async (req, res) => {
    try {
        const { affliate_id } = req.params;
        const company = await companyModel.getCompanyById(affliate_id);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json({ success: true, data: company });
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get company contacts (with access control based on verification)
router.get('/:affliate_id/contacts', authenticateToken, async (req, res) => {
    try {
        const { affliate_id } = req.params;
        const user_id = req.user.user_id;

        // Check user verification status
        const userStatus = await userModel.getUserVerificationStatus(user_id);
        const hasFullAccess = userStatus.identity_verified || userStatus.entity_id; // Entity-linked users get full access

        const contacts = await employeeModel.getEmployeesByCompany(affliate_id, hasFullAccess);

        res.json({
            success: true,
            data: contacts,
            access_level: hasFullAccess ? 'full' : 'limited',
            message: hasFullAccess ?
                'Full access granted - contact details visible' :
                'Limited access - verify your identity to see contact details',
            user_verification: {
                identity_verified: userStatus.identity_verified,
                entity_linked: !!userStatus.entity_id,
                verification_method: userStatus.verification_method
            }
        });
    } catch (error) {
        console.error('Error fetching company contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search contacts across all companies (authenticated users only)
router.get('/contacts/search', authenticateToken, [
    query('q').notEmpty().isString().trim().isLength({ min: 2 }),
    query('affliate_id').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { q: searchTerm, affliate_id, page = 1, limit = 20 } = req.query;
        const user_id = req.user.user_id;

        // Check user verification status
        const userStatus = await userModel.getUserVerificationStatus(user_id);
        const hasFullAccess = userStatus.identity_verified || userStatus.entity_id;

        const contacts = await employeeModel.searchEmployees(searchTerm, affliate_id, hasFullAccess);

        res.json({
            success: true,
            data: contacts,
            access_level: hasFullAccess ? 'full' : 'limited',
            total: contacts.length,
            user_verification: {
                identity_verified: userStatus.identity_verified,
                entity_linked: !!userStatus.entity_id,
                verification_method: userStatus.verification_method
            }
        });
    } catch (error) {
        console.error('Error searching contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
