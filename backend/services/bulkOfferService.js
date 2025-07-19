const XLSX = require('xlsx');
const { OffersModel } = require('../models/offers.model.pg.js');
const { v4: uuidv4 } = require('uuid');

class BulkOfferService {
    constructor() {
        this.requiredFields = [
            'title',
            'target_geo',
            'payout_type',
            'payout_value',
            'landing_page_url'
        ];

        this.optionalFields = [
            'description',
            'category', 
            'requirements',
            'allowed_traffic_sources',
            'private_offer',
            'offer_status'
        ];

        // Field mappings for flexible column matching
        this.fieldMappings = {
            title: ['title', 'offer_title', 'name', 'offer_name', 'campaign_name', 'campaign_title'],
            category: ['category', 'vertical', 'niche', 'offer_category', ],
            description: ['description', 'offer_description', 'details', 'campaign_details'],
            target_geo: ['target_geo', 'geo', 'countries', 'geography', 'target_countries', 'geos', 'coverage'],
            payout_type: ['payout_type', 'commission_type', 'model', 'payment_model'],
            payout_value: ['payout_value', 'payout', 'commission', 'rate', 'cpa', 'cpl', 'cpi'],
            landing_page_url: ['landing_page_url', 'landing_page', 'url', 'offer_url', 'link'],
            requirements: ['requirements', 'terms', 'conditions', 'restrictions'],
            allowed_traffic_sources: ['allowed_traffic_sources', 'traffic_sources', 'allowed_sources', 'tchannels'],
            private_offer: ['private_offer', 'private', 'exclusive'],
            offer_status: ['offer_status', 'status', 'state']
        };

        this.validPayoutTypes = ['CPA', 'CPL', 'CPI', 'RevShare'];
        this.validStatuses = ['active', 'paused', 'expired', 'draft'];
    }

    /**
     * Process Excel file and extract offer data
     */
    async processExcelFile(buffer, entityId) {
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
                processedOffers: []
            };

            // Detect column mappings
            const columnMappings = this.detectColumnMappings(Object.keys(jsonData[0]));
            
            for (let i = 0; i < jsonData.length; i++) {
                try {
                    const row = jsonData[i];
                    const processedOffer = this.processOfferRow(row, columnMappings, entityId, i + 2);
                    
                    // Validate the processed offer
                    const validation = this.validateOffer(processedOffer);
                    if (!validation.isValid) {
                        results.failed++;
                        results.errors.push({
                            row: i + 2,
                            errors: validation.errors,
                            data: row
                        });
                        continue;
                    }

                    results.processedOffers.push(processedOffer);
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
     * Detect column mappings based on header names
     */
    detectColumnMappings(headers) {
        const mappings = {};
        
        for (const [field, variations] of Object.entries(this.fieldMappings)) {
            const matchedHeader = headers.find(header => 
                variations.some(variation => 
                    header.toLowerCase().replace(/[_\s]/g, '') === variation.toLowerCase().replace(/[_\s]/g, '')
                )
            );
            
            if (matchedHeader) {
                mappings[field] = matchedHeader;
            }
        }

        return mappings;
    }

    /**
     * Process a single offer row
     */
    processOfferRow(row, columnMappings, entityId, rowNumber) {
        const offer = {
            offer_id: uuidv4(),
            entity_id: entityId
        };

        // Process each field
        for (const field of [...this.requiredFields, ...this.optionalFields]) {
            const columnName = columnMappings[field];
            if (columnName && row[columnName] !== undefined && row[columnName] !== '') {
                let value = row[columnName];

                // Apply field-specific processing
                switch (field) {
                    case 'target_geo':
                        offer[field] = this.processTargetGeo(value);
                        break;
                    case 'payout_type':
                        offer[field] = this.processPayoutType(value);
                        break;
                    case 'payout_value':
                        offer[field] = this.processPayoutValue(value);
                        break;
                    case 'allowed_traffic_sources':
                        offer[field] = this.processTrafficSources(value);
                        break;
                    case 'private_offer':
                        offer[field] = this.processBoolean(value);
                        break;
                    case 'offer_status':
                        offer[field] = this.processStatus(value);
                        break;
                    case 'landing_page_url':
                        offer[field] = this.processUrl(value);
                        break;
                    default:
                        offer[field] = typeof value === 'string' ? value.trim() : value;
                }
            }
        }

        // Set defaults for optional fields
        if (!offer.offer_status) offer.offer_status = 'draft';
        if (!offer.private_offer) offer.private_offer = false;
        if (!offer.requirements) offer.requirements = '';
        if (!offer.description) offer.description = '';
        if (!offer.category) offer.category = 'NA';

        return offer;
    }

    /**
     * Process target geo field (convert to array)
     */
    processTargetGeo(value) {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            return value.split(',').map(geo => geo.trim()).filter(geo => geo.length > 0);
        }
        return [value.toString()];
    }

    /**
     * Process payout type field
     */
    processPayoutType(value) {
        const normalized = value.toString().toUpperCase();
        return this.validPayoutTypes.includes(normalized) ? normalized : 'CPA';
    }

    /**
     * Process payout value field
     */
    processPayoutValue(value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            throw new Error(`Invalid payout value: ${value}`);
        }
        return numValue;
    }

    /**
     * Process traffic sources field
     */
    processTrafficSources(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            return value.split(',').map(source => source.trim()).filter(source => source.length > 0);
        }
        return [value.toString()];
    }

    /**
     * Process boolean field
     */
    processBoolean(value) {
        if (typeof value === 'boolean') return value;
        const str = value.toString().toLowerCase();
        return str === 'true' || str === '1' || str === 'yes';
    }

    /**
     * Process status field
     */
    processStatus(value) {
        const normalized = value.toString().toLowerCase();
        return this.validStatuses.includes(normalized) ? normalized : 'draft';
    }

    /**
     * Process URL field
     */
    processUrl(value) {
        const url = value.toString().trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    /**
     * Validate processed offer data
     */
    validateOffer(offer) {
        const errors = [];

        // Check required fields
        for (const field of this.requiredFields) {
            if (!offer[field] || (Array.isArray(offer[field]) && offer[field].length === 0)) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Validate specific fields
        if (offer.title && offer.title.length < 3) {
            errors.push('Title must be at least 3 characters long');
        }

        if (offer.description && offer.description.length > 0 && offer.description.length < 10) {
            errors.push('Description must be at least 10 characters long if provided');
        }

        if (offer.payout_type && !this.validPayoutTypes.includes(offer.payout_type)) {
            errors.push(`Invalid payout type. Must be one of: ${this.validPayoutTypes.join(', ')}`);
        }

        if (offer.payout_value && (isNaN(offer.payout_value) || offer.payout_value <= 0)) {
            errors.push('Payout value must be a positive number');
        }

        if (offer.landing_page_url) {
            try {
                new URL(offer.landing_page_url);
            } catch {
                errors.push('Invalid landing page URL');
            }
        }

        if (offer.offer_status && !this.validStatuses.includes(offer.offer_status)) {
            errors.push(`Invalid status. Must be one of: ${this.validStatuses.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Save processed offers to database
     */
    async saveOffers(offers) {
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < offers.length; i++) {
            try {
                await OffersModel.createOffer(offers[i]);
                results.successful++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    offer: offers[i],
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = new BulkOfferService();
