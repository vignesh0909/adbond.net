# Entity Management API Documentation

This document describes the entity management APIs for registering and managing advertisers, affiliates, and networks in the LinkedIn.us platform.

## Base URL
```
http://localhost:4100/api/entities
```

## Authentication
Most endpoints require a JWT token to be sent in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Entity Types
The system supports three types of entities:
- **advertiser**: Companies that want to advertise their products/services
- **affiliate**: Marketers who promote offers and earn commissions
- **network**: Platforms that connect advertisers with affiliates

## Endpoints

### 1. Entity Registration
**POST** `/register`

Register a new entity (advertiser, affiliate, or network). This endpoint is **public** and doesn't require authentication.

**Request Body:**
```json
{
  "entity_type": "advertiser",
  "name": "Test Advertiser Co",
  "email": "contact@testadvertiser.com",
  "website_url": "https://testadvertiser.com",
  "contact_info": {
    "phone": "+1234567890",
    "telegram": "@testadvertiser",
    "skype": "testadvertiser"
  },
  "description": "We are a test advertiser company specializing in digital marketing and online advertising campaigns.",
  "entity_metadata": {
    "company_size": "50-100",
    "industries": ["technology", "marketing"],
    "founded_year": 2020
  },
  "image_url": "https://example.com/logo.png",
  "additional_request": "Please prioritize our verification as we have urgent campaigns to launch."
}
```

**Validation Rules:**
- `entity_type`: Required, must be one of: advertiser, affiliate, network
- `name`: Required, 2-200 characters
- `email`: Required, valid email format, unique
- `website_url`: Required, valid HTTP/HTTPS URL
- `contact_info`: Required object with at least one contact method (phone, telegram, or skype)
- `description`: Required, 10-2000 characters
- `entity_metadata`: Required object (contents depend on entity type)
- `image_url`: Optional, valid URL
- `additional_request`: Optional, max 1000 characters

**Success Response (201):**
```json
{
  "message": "Entity registered successfully. Pending verification.",
  "entity": {
    "entity_id": "uuid-string",
    "entity_type": "advertiser",
    "name": "Test Advertiser Co",
    "email": "contact@testadvertiser.com",
    "website_url": "https://testadvertiser.com",
    "description": "We are a test advertiser company...",
    "verification_status": "pending",
    "created_at": "2025-05-30T10:33:29.680Z"
  }
}
```

### 2. Get Public Entities
**GET** `/public`

Get all approved and public entities. No authentication required.

**Query Parameters:**
- `entity_type` (optional): Filter by entity type

**Success Response (200):**
```json
{
  "entities": [
    {
      "entity_id": "uuid-string",
      "entity_type": "advertiser",
      "name": "Test Advertiser Co",
      "website_url": "https://testadvertiser.com",
      "image_url": "https://example.com/logo.png",
      "description": "We are a test advertiser company...",
      "reputation_score": "4.50",
      "total_reviews": 25,
      "created_at": "2025-05-30T10:33:29.680Z"
    }
  ],
  "count": 1
}
```

### 3. Get Entities by Type
**GET** `/type/:type`

Get entities of a specific type with pagination. No authentication required.

**Path Parameters:**
- `type`: Entity type (advertiser, affiliate, network)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "message": "advertisers retrieved successfully",
  "entities": [
    {
      "entity_id": "uuid-string",
      "entity_type": "advertiser",
      "name": "Test Advertiser Co",
      "email": "contact@testadvertiser.com",
      "website_url": "https://testadvertiser.com",
      "image_url": "https://example.com/logo.png",
      "description": "We are a test advertiser company...",
      "verification_status": "approved",
      "reputation_score": "4.50",
      "total_reviews": 25,
      "is_public": true,
      "created_at": "2025-05-30T10:33:29.680Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 4. Get All Entities (Authenticated)
**GET** `/`

Get all entities with optional filters. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `entity_type` (optional): Filter by entity type
- `verification_status` (optional): Filter by verification status
- `is_public` (optional): Filter by public status (true/false)

**Success Response (200):**
```json
{
  "entities": [
    // Array of entity objects with full details
  ],
  "count": 10,
  "filters": {
    "entity_type": "advertiser",
    "verification_status": "approved"
  }
}
```

### 5. Get Entity by ID (Authenticated)
**GET** `/:id`

Get a specific entity by its ID. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "entity": {
    "entity_id": "uuid-string",
    "entity_type": "advertiser",
    "name": "Test Advertiser Co",
    "email": "contact@testadvertiser.com",
    "website_url": "https://testadvertiser.com",
    "contact_info": {
      "phone": "+1234567890",
      "telegram": "@testadvertiser",
      "skype": "testadvertiser"
    },
    "image_url": "https://example.com/logo.png",
    "description": "We are a test advertiser company...",
    "verification_status": "approved",
    "entity_metadata": {
      "company_size": "50-100",
      "industries": ["technology", "marketing"],
      "founded_year": 2020
    },
    "additional_request": "Please prioritize our verification...",
    "reputation_score": "4.50",
    "total_reviews": 25,
    "is_public": true,
    "created_at": "2025-05-30T10:33:29.680Z",
    "updated_at": "2025-05-30T10:37:30.551Z"
  }
}
```

### 6. Update Entity (Authenticated)
**PUT** `/:id`

Update entity information. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "description": "Updated description with new information about our services.",
  "entity_metadata": {
    "company_size": "100-200",
    "industries": ["technology", "marketing", "performance"],
    "founded_year": 2020,
    "certifications": ["Google Ads", "Facebook Marketing"]
  },
  "is_public": true
}
```

**Success Response (200):**
```json
{
  "message": "Entity updated successfully",
  "entity": {
    // Updated entity object
  }
}
```

### 7. Update Verification Status (Admin Only)
**PUT** `/:id/verification`

Update entity verification status. Requires admin role.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "verification_status": "approved",
  "admin_notes": "Entity verification completed. All documents are valid."
}
```

**Validation Rules:**
- `verification_status`: Required, must be one of: pending, approved, rejected, on_hold
- `admin_notes`: Optional, max 1000 characters

**Success Response (200):**
```json
{
  "message": "Entity verification status updated successfully",
  "entity": {
    "entity_id": "uuid-string",
    "entity_type": "advertiser",
    "name": "Test Advertiser Co",
    "email": "contact@testadvertiser.com",
    "verification_status": "approved",
    "updated_at": "2025-05-30T10:36:31.669Z"
  }
}
```

### 8. Delete Entity (Admin Only)
**DELETE** `/:id`

Delete an entity. Requires admin role.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Entity deleted successfully"
}
```

## Example Usage

### Register a new advertiser:
```bash
curl -X POST http://localhost:4100/api/entities/register \
  -H "Content-Type: application/json" \
  -d '{
    "entity_type": "advertiser",
    "name": "My Ad Company",
    "email": "contact@myadcompany.com",
    "website_url": "https://myadcompany.com",
    "contact_info": {
      "phone": "+1234567890",
      "telegram": "@myadcompany"
    },
    "description": "We specialize in performance marketing and lead generation.",
    "entity_metadata": {
      "company_size": "10-50",
      "industries": ["marketing", "technology"],
      "founded_year": 2022
    }
  }'
```

### Get public entities:
```bash
curl -X GET http://localhost:4100/api/entities/public
```

### Get entities by type:
```bash
curl -X GET "http://localhost:4100/api/entities/type/affiliate?page=1&limit=10"
```

### Update verification status (admin):
```bash
curl -X PUT http://localhost:4100/api/entities/YOUR_ENTITY_ID/verification \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_status": "approved",
    "admin_notes": "Verification completed successfully."
  }'
```

## Entity Metadata Examples

### Advertiser Metadata:
```json
{
  "company_size": "50-100",
  "industries": ["technology", "marketing", "fintech"],
  "founded_year": 2020,
  "certifications": ["Google Ads", "Facebook Marketing"],
  "budget_range": "10k-50k",
  "target_geos": ["US", "CA", "UK"]
}
```

### Affiliate Metadata:
```json
{
  "specialties": ["finance", "health", "ecommerce"],
  "traffic_sources": ["social", "email", "seo"],
  "payment_terms": "weekly",
  "minimum_payout": 50,
  "experience_years": 5
}
```

### Network Metadata:
```json
{
  "network_type": "performance",
  "supported_models": ["CPA", "CPL", "CPI", "RevShare"],
  "tracking_platform": "custom",
  "global_reach": true,
  "verticals": ["finance", "health", "gaming"],
  "payment_methods": ["wire", "paypal", "crypto"]
}
```

## Verification Status Flow

1. **pending**: Initial status when entity is registered
2. **approved**: Entity has been verified and can be public
3. **rejected**: Entity verification failed
4. **on_hold**: Verification is paused pending additional information

## Security Features

1. **Input Validation**: Comprehensive validation using express-validator
2. **Role-based Access Control**: Admin-only functions for verification and deletion
3. **Email Uniqueness**: Prevents duplicate entity registrations
4. **Data Sanitization**: All inputs are sanitized and validated
5. **Public/Private Control**: Entities can control their public visibility

## Error Responses

**400 Bad Request:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "Entity not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

## Database Schema

The `entities` table includes:
- `entity_id`: Primary key (UUID)
- `entity_type`: Type of entity (advertiser, affiliate, network)
- `name`: Entity name
- `email`: Unique email address
- `website_url`: Entity website URL
- `contact_info`: JSON object with contact methods
- `image_url`: Entity logo/image URL
- `description`: Entity description
- `verification_status`: Verification status (pending, approved, rejected, on_hold)
- `entity_metadata`: JSON object with type-specific metadata
- `additional_request`: Optional additional information
- `reputation_score`: Entity reputation (0.00-5.00)
- `total_reviews`: Number of reviews received
- `is_public`: Whether entity appears in public listings
- `created_at`, `updated_at`: Timestamps

## Related Tables

- `reviews`: Entity reviews and ratings
- `review_replies`: Replies to reviews
- `access_requests`: Requests for entity contact information
