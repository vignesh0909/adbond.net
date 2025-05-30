# Entity API Update Summary

## Schema Changes Made

### Database Schema Updates
1. **Column Rename**: `website_url` → `website`
2. **Removed Fields**: `image_url`, `additional_request`
3. **Added Fields**: `secondary_email`, `additional_notes`, `how_you_heard`
4. **Contact Info Validation**: Updated to include `teams` and improved OR logic
5. **Entity Metadata**: Now supports dynamic fields based on entity type

### New Entity Metadata Structure

#### Network Entities
- `network_name` (required)
- `signup_url` (required)
- `tracking_platform` (required)
- `supported_models` (required) - Array of CPA, CPL, CPI, RevShare
- `verticals` (required) - Array of industry verticals
- `payment_terms` (required) - Payment frequency
- `offers_available` (optional) - Number of available offers
- `minimum_payout` (optional) - Minimum payout amount
- `referral_commission` (optional) - Commission percentage

#### Affiliate Entities
- `verticals` (required) - Array of industry focus areas
- `monthly_revenue` (required) - Monthly revenue amount
- `traffic_provided_geos` (required) - Array of geographic locations
- `reference_details` (optional) - Reference information object

#### Advertiser Entities
- `company_name` (required)
- `signup_url` (required)
- `program_name` (required)
- `program_category` (required)
- `payout_types` (required) - Array of CPC, CPM, CPL, CPA
- `payment_terms` (required) - Payment terms
- `social_media` (optional) - Social media links object
- `referral_commission` (optional) - Commission percentage

## API Endpoints Added/Updated

### New Public Endpoints
1. **GET /api/entities/metadata/template/:type** - Get metadata template for entity type
2. **GET /api/entities/search** - Advanced search with multiple filters
3. **GET /api/entities/statistics** - Get entity statistics
4. **GET /api/entities/by-criteria** - Filter entities by metadata criteria
5. **POST /api/entities/validate** - Validate entity data before submission

### New Protected Endpoints
6. **GET /api/entities/email/:email** - Get entity by email address

### New Admin Endpoints
7. **GET /api/entities/admin/pending-verification** - Get entities pending verification
8. **PUT /api/entities/admin/bulk-verification** - Bulk update verification status
9. **PUT /api/entities/:id/reputation** - Update entity reputation score

### Updated Existing Endpoints
- **POST /api/entities/register** - Updated to handle new schema
- **PUT /api/entities/:id** - Updated to handle new schema
- **GET /api/entities/public** - Updated response structure
- All entity retrieval endpoints now return new schema fields

## New Model Methods Added

### Validation & Utility Methods
1. `validateEntityMetadata(entity_type, metadata)` - Validate metadata based on type
2. `createDefaultMetadata(entity_type, customData)` - Create default metadata structure

### Search & Filtering Methods
3. `searchEntities(filters, page, limit)` - Advanced search with multiple criteria
4. `getEntityStatistics()` - Get comprehensive entity statistics

### Admin & Management Methods
5. `updateEntityReputation(entity_id, new_rating)` - Update reputation scores
6. `getEntitiesPendingVerification(page, limit)` - Get entities needing verification
7. `bulkUpdateVerificationStatus(entity_ids, status, notes)` - Bulk verification updates

## Key Features Added

### 1. Metadata Validation
- Type-specific validation for entity metadata
- Required field checking based on entity type
- Default metadata structure generation

### 2. Advanced Search
- Full-text search in name and description
- JSON field searching (verticals, payment terms, etc.)
- Multiple filter combinations
- Reputation-based filtering

### 3. Enhanced Validation
- Comprehensive pre-submission validation
- Email format validation
- URL validation
- Contact method validation
- Business logic warnings

### 4. Admin Tools
- Bulk operations for verification status
- Pending verification queue management
- Entity statistics and analytics
- Reputation management system

### 5. Improved Contact Methods
- Support for Teams, LinkedIn, Telegram
- Flexible contact validation
- Enhanced contact information structure

## API Response Improvements

### 1. Consistent Error Handling
- Structured error responses
- Validation error details
- Warning messages for non-critical issues

### 2. Enhanced Data Structure
- Entity metadata included in public responses
- Comprehensive entity information
- Pagination support across all list endpoints

### 3. Statistics & Analytics
- Entity distribution by type and status
- Average reputation scores
- Review count statistics

## Validation Rules Updated

### Required Fields by Entity Type
- **Network**: network_name, signup_url, tracking_platform, supported_models, verticals, payment_terms
- **Affiliate**: verticals, monthly_revenue, traffic_provided_geos
- **Advertiser**: company_name, signup_url, program_name, program_category, payout_types, payment_terms

### Contact Information
- At least one contact method required: phone, teams, linkedin, telegram, or address
- LinkedIn URL validation
- Email format validation for both primary and secondary emails

### Business Logic Validation
- Entity uniqueness by email
- Metadata structure validation
- URL format validation
- Rating bounds checking (1-5)

## Database Compatibility

### Migration Considerations
- Column rename: `website_url` to `website`
- New columns: `secondary_email`, `additional_notes`, `how_you_heard`
- Updated CHECK constraint for contact_info
- Existing data migration may be needed

### Performance Optimizations
- Maintained existing indexes
- JSON field indexing considerations for search functionality
- Pagination support for large datasets

## Security Enhancements

### Authentication & Authorization
- Admin-only routes properly protected
- Role-based access control
- JWT token validation
- Input sanitization and validation

### Data Privacy
- Sensitive information filtering in public endpoints
- Email-based entity lookup restricted to authenticated users
- Admin notes and internal data protection

This update provides a comprehensive entity management system with enhanced functionality, better validation, and improved admin tools while maintaining backward compatibility where possible.
