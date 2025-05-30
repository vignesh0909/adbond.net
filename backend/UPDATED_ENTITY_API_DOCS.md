# Updated Entity API Documentation

## Overview
This document describes the updated Entity API endpoints with the new schema structure where `entity_metadata` contains dynamic fields based on entity type.

## Base URL
```
/api/entities
```

## Entity Schema

### Common Fields (All Entity Types)
```json
{
  "name": "string",
  "email": "string",
  "secondary_email": "string (optional)",
  "website": "string",
  "contact_info": {
    "phone": "string (optional)",
    "teams": "string (optional)", 
    "linkedin": "string (optional)",
    "telegram": "string (optional)",
    "address": "string (optional)"
  },
  "description": "string",
  "additional_notes": "string (optional)",
  "how_you_heard": "string (optional)"
}
```

### Entity Metadata by Type

#### Network Entity Metadata
```json
{
  "entity_metadata": {
    "network_name": "string",
    "signup_url": "string", 
    "tracking_platform": "string",
    "supported_models": ["CPA", "CPL", "CPI", "RevShare"],
    "verticals": ["Finance", "Health", "E-commerce", "Travel"],
    "payment_terms": "Net 90/Net 60/Net 45/Net 30/Net 15/Net 7/Weekly/Biweekly",
    "offers_available": 10,
    "minimum_payout": 100,
    "referral_commission": 0.1
  }
}
```

#### Affiliate Entity Metadata
```json
{
  "entity_metadata": {
    "verticals": ["Finance", "Health"],
    "monthly_revenue": 50000,
    "traffic_provided_geos": ["US", "UK", "CA"],
    "reference_details": {
      "previous_networks": ["Network1", "Network2"],
      "experience_years": 5
    }
  }
}
```

#### Advertiser Entity Metadata
```json
{
  "entity_metadata": {
    "company_name": "AdNetworkX Advertiser",
    "signup_url": "https://www.adnetworkx.com/advertiser-signup",
    "program_name": "AdNetworkX Program", 
    "program_category": "Digital Marketing",
    "social_media": {
      "facebook": "https://www.facebook.com/adnetworkx",
      "twitter": "https://twitter.com/adnetworkx",
      "linkedin": "https://www.linkedin.com/company/adnetworkx"
    },
    "payout_types": ["CPC", "CPM", "CPL", "CPA"],
    "payment_terms": "Net 30",
    "referral_commission": 0.1
  }
}
```

## Public Endpoints (No Authentication Required)

### 1. Test Route
```http
GET /api/entities/test
```

**Response:**
```json
{
  "message": "Entity router is working!"
}
```

### 2. Get Public Entities
```http
GET /api/entities/public?entity_type=network
```

**Query Parameters:**
- `entity_type` (optional): Filter by entity type (advertiser, affiliate, network)

**Response:**
```json
{
  "entities": [
    {
      "entity_id": "uuid",
      "entity_type": "network",
      "name": "AdNetwork X",
      "website": "https://adnetworkx.com",
      "description": "Leading ad network...",
      "reputation_score": 4.5,
      "total_reviews": 25,
      "created_at": "2025-05-30T10:00:00Z",
      "entity_metadata": {
        "network_name": "AdNetwork X",
        "supported_models": ["CPA", "CPL"],
        "verticals": ["Finance", "Health"]
      }
    }
  ],
  "count": 1
}
```

### 3. Get Entities by Type
```http
GET /api/entities/type/network?page=1&limit=10
```

**Path Parameters:**
- `type`: Entity type (advertiser, affiliate, network)

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page

### 4. Get Entity Metadata Template
```http
GET /api/entities/metadata/template/network
```

**Response:**
```json
{
  "message": "Metadata template for network",
  "entity_type": "network",
  "common_fields": {
    "name": "string - Entity name",
    "email": "string - Primary email address",
    "contact_info": {
      "phone": "string - Phone number",
      "teams": "string - Microsoft Teams contact",
      "linkedin": "string - LinkedIn profile URL",
      "telegram": "string - Telegram handle", 
      "address": "string - Physical address"
    }
  },
  "type_specific_metadata": {
    "network_name": "",
    "signup_url": "",
    "tracking_platform": "",
    "supported_models": [],
    "verticals": [],
    "payment_terms": "",
    "offers_available": 0,
    "minimum_payout": 0,
    "referral_commission": 0
  }
}
```

### 5. Advanced Search
```http
GET /api/entities/search?entity_type=network&verticals=Finance,Health&min_reputation=4.0&page=1&limit=10
```

**Query Parameters:**
- `entity_type`: Filter by entity type
- `verification_status`: Filter by verification status
- `is_public`: Filter by public visibility (true/false)
- `search_term`: Search in name and description
- `min_reputation`: Minimum reputation score
- `verticals`: Comma-separated list of verticals
- `payment_terms`: Filter by payment terms
- `supported_models`: Comma-separated list of supported models
- `page`: Page number
- `limit`: Items per page

### 6. Get Entity Statistics
```http
GET /api/entities/statistics
```

**Response:**
```json
{
  "message": "Entity statistics retrieved successfully",
  "statistics": {
    "by_type_and_status": [
      {
        "entity_type": "network",
        "verification_status": "approved",
        "count": "15",
        "avg_reputation": "4.25",
        "avg_reviews": "22.5"
      }
    ],
    "overall": {
      "total_entities": "50",
      "public_entities": "45", 
      "approved_entities": "40",
      "overall_avg_reputation": "4.1"
    }
  }
}
```

### 7. Get Entities by Criteria
```http
GET /api/entities/by-criteria?entity_type=network&verticals=Finance&payment_terms=Net 30&min_payout=100
```

**Query Parameters:**
- `entity_type` (required): Entity type
- `verticals`: Comma-separated list of verticals
- `payment_terms`: Payment terms
- `supported_models`: Comma-separated list of supported models
- `min_payout`: Minimum payout (for networks)
- `page`: Page number
- `limit`: Items per page

### 8. Validate Entity Data
```http
POST /api/entities/validate
```

**Request Body:**
```json
{
  "entity_type": "network",
  "name": "Test Network",
  "email": "test@example.com",
  "website": "https://testnetwork.com",
  "contact_info": {
    "phone": "+1234567890",
    "linkedin": "https://linkedin.com/company/testnetwork"
  },
  "description": "A test network for validation purposes with sufficient description length",
  "entity_metadata": {
    "network_name": "Test Network",
    "signup_url": "https://testnetwork.com/signup",
    "tracking_platform": "Custom Platform",
    "supported_models": ["CPA", "CPL"],
    "verticals": ["Finance"],
    "payment_terms": "Net 30"
  }
}
```

**Response:**
```json
{
  "is_valid": true,
  "errors": [],
  "warnings": [
    "Description should be at least 50 characters for better visibility"
  ],
  "message": "Entity data is valid"
}
```

### 9. Entity Registration
```http
POST /api/entities/register
```

**Request Body:**
```json
{
  "entity_type": "network",
  "name": "AdNetwork Pro",
  "email": "contact@adnetworkpro.com",
  "secondary_email": "support@adnetworkpro.com",
  "website": "https://adnetworkpro.com",
  "contact_info": {
    "phone": "+1-555-0123",
    "linkedin": "https://linkedin.com/company/adnetworkpro",
    "telegram": "@adnetworkpro",
    "address": "123 Business Ave, NYC, NY 10001"
  },
  "description": "Professional ad network specializing in high-quality traffic and premium offers across multiple verticals.",
  "additional_notes": "Looking to expand our affiliate base",
  "how_you_heard": "Google Search",
  "entity_metadata": {
    "network_name": "AdNetwork Pro",
    "signup_url": "https://adnetworkpro.com/signup",
    "tracking_platform": "HasOffers",
    "supported_models": ["CPA", "CPL", "CPI", "RevShare"],
    "verticals": ["Finance", "Health", "E-commerce", "Travel"],
    "payment_terms": "Net 15",
    "offers_available": 250,
    "minimum_payout": 50,
    "referral_commission": 0.05
  }
}
```

**Response:**
```json
{
  "message": "Entity registered successfully. Pending verification.",
  "entity": {
    "entity_id": "uuid",
    "entity_type": "network",
    "name": "AdNetwork Pro",
    "email": "contact@adnetworkpro.com",
    "secondary_email": "support@adnetworkpro.com",
    "website": "https://adnetworkpro.com",
    "description": "Professional ad network...",
    "verification_status": "pending",
    "created_at": "2025-05-30T10:00:00Z"
  }
}
```

## Protected Endpoints (Authentication Required)

### 10. Get All Entities
```http
GET /api/entities?entity_type=network&verification_status=approved
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `entity_type`: Filter by entity type
- `verification_status`: Filter by verification status
- `is_public`: Filter by public visibility

### 11. Get Entity by ID
```http
GET /api/entities/{entity_id}
```

### 12. Get Entity by Email
```http
GET /api/entities/email/{email}
```

### 13. Update Entity
```http
PUT /api/entities/{entity_id}
```

**Request Body:** (Same structure as registration, all fields optional)

## Admin Only Endpoints

### 14. Update Verification Status
```http
PUT /api/entities/{entity_id}/verification
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "verification_status": "approved",
  "admin_notes": "Entity verified successfully"
}
```

### 15. Get Pending Verification Entities
```http
GET /api/entities/admin/pending-verification?page=1&limit=10
```

### 16. Bulk Update Verification Status
```http
PUT /api/entities/admin/bulk-verification
```

**Request Body:**
```json
{
  "entity_ids": ["uuid1", "uuid2", "uuid3"],
  "verification_status": "approved",
  "admin_notes": "Bulk approval after review"
}
```

### 17. Update Entity Reputation
```http
PUT /api/entities/{entity_id}/reputation
```

**Request Body:**
```json
{
  "new_rating": 4.5
}
```

### 18. Delete Entity
```http
DELETE /api/entities/{entity_id}
```

## Error Responses

### Validation Error
```json
{
  "message": "All required fields must be provided",
  "required": ["entity_type", "name", "email", "website", "contact_info", "description", "entity_metadata"]
}
```

### Not Found Error
```json
{
  "message": "Entity not found"
}
```

### Duplicate Email Error
```json
{
  "message": "Entity already exists with this email"
}
```

### Metadata Validation Error
```json
{
  "message": "Missing required fields for network: network_name, signup_url, tracking_platform"
}
```

## Status Codes

- **200** - Success
- **201** - Created (for registration)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate data)
- **500** - Internal Server Error

## Notes

1. **Entity Types**: Must be one of: `advertiser`, `affiliate`, `network`
2. **Verification Status**: `pending`, `approved`, `rejected`, `on_hold`
3. **Contact Info**: At least one contact method is required
4. **Entity Metadata**: Must contain required fields based on entity type
5. **Search**: Supports full-text search in name and description fields
6. **Pagination**: Default page size is 10, maximum is 100
7. **Public Routes**: Return only approved and public entities
8. **Admin Routes**: Require admin role authentication
