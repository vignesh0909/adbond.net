const XLSX = require('xlsx');
const { OffersModel } = require('../models/offers.model.pg.js');
const { v4: uuidv4 } = require('uuid');

class BulkOfferRequestService {
    constructor() {
        this.requiredFields = [
            'title',
            'vertical',
            'geos_targeting',
            'traffic_type',
            'traffic_volume',
            'platforms_used'
        ];

        this.optionalFields = [
            'desired_payout_type',
            'budget_range',
            'notes',
            'request_status'
        ];

        // Field mappings for flexible column matching
        this.fieldMappings = {
            title: ['title', 'request_title', 'name', 'request_name', 'campaign_name'],
            vertical: ['vertical', 'category', 'niche', 'industry', 'sector'],
            geos_targeting: ['geos_targeting', 'geo', 'countries', 'geography', 'target_countries', 'geos', 'coverage'],
            traffic_type: ['traffic_type', 'traffic_sources', 'sources', 'channels'],
            traffic_volume: ['traffic_volume', 'volume', 'monthly_volume', 'clicks', 'impressions'],
            platforms_used: ['platforms_used', 'platforms', 'networks', 'channels'],
            desired_payout_type: ['desired_payout_type', 'payout_type', 'commission_type', 'model', 'payment_model'],
            budget_range: ['budget_range', 'budget', 'spend', 'monthly_budget'],
            notes: ['notes', 'description', 'details', 'comments', 'additional_info'],
            request_status: ['request_status', 'status', 'state']
        };

        this.validPayoutTypes = ['CPA', 'CPL', 'CPI', 'RevShare'];
        this.validStatuses = ['active', 'paused', 'draft'];
    }

    /**
     * Process Excel file and extract offer request data
     */
    async processExcelFile(buffer, userId, entityId) {
        try {
            const workbook = XLSX.read(buffer);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (!jsonData || jsonData.length === 0) {
                throw new Error('Excel file is empty or invalid');
            }

            const results = {
                total: jsonData.length,
                successful: 0,
                failed: 0,
                errors: [],
                processedRequests: []
            };

            // Detect column mappings
            const columnMappings = this.detectColumnMappings(Object.keys(jsonData[0]));
            
            for (let i = 0; i < jsonData.length; i++) {
                try {
                    const row = jsonData[i];
                    const processedRequest = this.processRequestRow(row, columnMappings, userId, entityId, i + 2);
                    
                    // Validate the processed request
                    const validation = this.validateRequest(processedRequest);
                    if (!validation.isValid) {
                        results.failed++;
                        results.errors.push({
                            row: i + 2,
                            errors: validation.errors,
                            data: row
                        });
                        continue;
                    }

                    results.processedRequests.push(processedRequest);
                    results.successful++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2,
                        errors: [error.message],
                        data: jsonData[i]
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Error processing Excel file:', error);
            throw new Error(`Failed to process Excel file: ${error.message}`);
        }
    }

    /**
     * Preview Excel file without saving
     */
    async previewExcelFile(buffer) {
        try {
            const processingResults = await this.processExcelFile(buffer, null, null);
            
            return {
                total: processingResults.total,
                valid: processingResults.successful,
                invalid: processingResults.failed,
                errors: processingResults.errors,
                sampleRequests: processingResults.processedRequests.slice(0, 5).map(request => ({
                    title: request.title,
                    vertical: request.vertical,
                    traffic_volume: request.traffic_volume
                }))
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Save processed requests to database
     */
    async saveRequestsToDatabase(processedRequests) {
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };

        for (const request of processedRequests) {
            try {
                const result = await OffersModel.createOfferRequest(request);
                if (result.success) {
                    results.successful++;
                } else {
                    results.failed++;
                    results.errors.push({
                        title: request.title,
                        error: result.error
                    });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    title: request.title,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Detect column mappings from header row
     */
    detectColumnMappings(headers) {
        const mappings = {};
        
        // Normalize headers for comparison
        const normalizedHeaders = headers.map(h => h.toLowerCase().trim().replace(/[^a-z0-9]/g, '_'));
        
        for (const [field, aliases] of Object.entries(this.fieldMappings)) {
            for (const alias of aliases) {
                const normalizedAlias = alias.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
                const matchIndex = normalizedHeaders.findIndex(h => h.includes(normalizedAlias) || normalizedAlias.includes(h));
                
                if (matchIndex !== -1) {
                    mappings[field] = headers[matchIndex];
                    break;
                }
            }
        }
        
        return mappings;
    }

    /**
     * Process a single row from Excel
     */
    processRequestRow(row, columnMappings, userId, entityId, rowNumber) {
        const request = {
            user_id: userId,
            entity_id: entityId,
            request_status: 'active'
        };

        // Map required fields
        for (const field of this.requiredFields) {
            const columnName = columnMappings[field];
            if (columnName && row[columnName]) {
                let value = row[columnName];
                
                if (field === 'geos_targeting' || field === 'traffic_type' || field === 'platforms_used') {
                    // Handle array fields
                    if (typeof value === 'string') {
                        value = value.split(',').map(item => item.trim()).filter(item => item);
                    }
                }
                
                if (field === 'traffic_volume') {
                    value = parseInt(value);
                    if (isNaN(value)) {
                        throw new Error(`Invalid traffic volume: ${row[columnName]}`);
                    }
                }
                
                request[field] = value;
            } else {
                throw new Error(`Required field '${field}' is missing or empty`);
            }
        }

        // Map optional fields
        for (const field of this.optionalFields) {
            const columnName = columnMappings[field];
            if (columnName && row[columnName]) {
                let value = row[columnName];
                
                if (field === 'desired_payout_type') {
                    value = value.toString().toUpperCase();
                    if (!this.validPayoutTypes.includes(value)) {
                        value = 'CPA'; // Default to CPA if invalid
                    }
                }
                
                if (field === 'request_status') {
                    value = value.toString().toLowerCase();
                    if (!this.validStatuses.includes(value)) {
                        value = 'active'; // Default to active if invalid
                    }
                }
                
                request[field] = value;
            }
        }

        // Set defaults for optional fields if not provided
        if (!request.desired_payout_type) {
            request.desired_payout_type = 'CPA';
        }
        if (!request.request_status) {
            request.request_status = 'active';
        }

        return request;
    }

    /**
     * Validate offer request data
     */
    validateRequest(request) {
        const errors = [];

        // Validate required fields
        for (const field of this.requiredFields) {
            if (!request[field]) {
                errors.push(`${field} is required`);
                continue;
            }

            // Field-specific validations
            switch (field) {
                case 'title':
                    if (request.title.length < 3) {
                        errors.push('Title must be at least 3 characters long');
                    }
                    break;
                    
                case 'vertical':
                    if (request.vertical.length === 0) {
                        errors.push('Vertical is required');
                    }
                    break;
                    
                case 'geos_targeting':
                    if (!Array.isArray(request.geos_targeting) || request.geos_targeting.length === 0) {
                        errors.push('Geos targeting must be a non-empty array');
                    }
                    break;
                    
                case 'traffic_type':
                    if (!Array.isArray(request.traffic_type) || request.traffic_type.length === 0) {
                        errors.push('Traffic type must be a non-empty array');
                    }
                    break;
                    
                case 'traffic_volume':
                    if (isNaN(request.traffic_volume) || request.traffic_volume <= 0) {
                        errors.push('Traffic volume must be a positive number');
                    }
                    break;
                    
                case 'platforms_used':
                    if (!Array.isArray(request.platforms_used) || request.platforms_used.length === 0) {
                        errors.push('Platforms used must be a non-empty array');
                    }
                    break;
            }
        }

        // Validate optional fields if present
        if (request.desired_payout_type && !this.validPayoutTypes.includes(request.desired_payout_type)) {
            errors.push(`Invalid payout type. Must be one of: ${this.validPayoutTypes.join(', ')}`);
        }

        if (request.request_status && !this.validStatuses.includes(request.request_status)) {
            errors.push(`Invalid status. Must be one of: ${this.validStatuses.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create Excel template for bulk upload
     */
    createTemplate() {
        const headers = [
            'title',
            'vertical',
            'geos_targeting',
            'traffic_type',
            'traffic_volume',
            'platforms_used',
            'desired_payout_type',
            'budget_range',
            'notes'
        ];

        const sampleData = [
            {
                title: 'Health & Wellness Offers',
                vertical: 'Health',
                geos_targeting: 'US, CA, UK',
                traffic_type: 'Social Media, Search',
                traffic_volume: 10000,
                platforms_used: 'Facebook, Google',
                desired_payout_type: 'CPA',
                budget_range: '$1000-$5000',
                notes: 'Looking for high-converting health offers'
            },
            {
                title: 'Finance Lead Generation',
                vertical: 'Finance',
                geos_targeting: 'US, AU',
                traffic_type: 'Email, Display',
                traffic_volume: 5000,
                platforms_used: 'Native Ads, Email Lists',
                desired_payout_type: 'CPL',
                budget_range: '$2000-$10000',
                notes: 'Specialized in finance lead gen'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Offer Requests');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}

module.exports = new BulkOfferRequestService();
