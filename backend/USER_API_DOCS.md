# User Authentication API Documentation

This document describes the user authentication APIs that have been implemented for login and signup functionality.

## Base URL
```
http://localhost:4100/api/users
```

## Authentication
Most endpoints require a JWT token to be sent in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. User Registration (Signup)
**POST** `/register`

Register a new user in the system.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "role": "user" // Optional: user, advertiser, affiliate, network, admin
}
```

**Validation Rules:**
- `first_name`: Required, 2-50 characters
- `last_name`: Optional, max 50 characters
- `email`: Required, valid email format
- `password`: Required, min 6 characters, must contain uppercase, lowercase, and number
- `role`: Optional, defaults to "user"

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid-string",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error Responses:**
- `400`: Validation errors or user already exists
- `500`: Internal server error

### 2. User Login
**POST** `/login`

Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid-string",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "status": "active",
    "profile_image_url": null,
    "linkedin_profile": null,
    "identity_verified": false,
    "last_login": "2025-05-30T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials or inactive account
- `500`: Internal server error

### 3. Get Current User Profile
**GET** `/profile`

Get the profile information of the currently authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "user": {
    "user_id": "uuid-string",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "status": "active",
    "profile_image_url": null,
    "linkedin_profile": null,
    "identity_verified": false,
    "last_login": "2025-05-30T10:30:00.000Z",
    "created_at": "2025-05-30T09:00:00.000Z"
  }
}
```

### 4. Update User Profile
**PUT** `/profile/:id`

Update user profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "profile_image_url": "https://example.com/image.jpg",
  "linkedin_profile": "https://linkedin.com/in/johnsmith"
}
```

**Success Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    // Updated user object
  }
}
```

### 5. Get All Users (Admin Only)
**GET** `/`

Get a list of all users. Requires admin role.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Success Response (200):**
```json
{
  "users": [
    // Array of user objects
  ],
  "count": 10
}
```

### 6. Get User by ID (Admin Only)
**GET** `/:id`

Get a specific user by their ID. Requires admin role.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### 7. Delete User (Admin Only)
**DELETE** `/:id`

Delete a user. Requires admin role.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

## Example Usage

### Register a new user:
```bash
curl -X POST http://localhost:4100/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:4100/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### Get profile (with token):
```bash
curl -X GET http://localhost:4100/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs with 12 salt rounds
2. **JWT Tokens**: Secure token-based authentication with 24-hour expiration
3. **Input Validation**: Comprehensive validation using express-validator
4. **Role-based Access Control**: Different access levels for users and admins
5. **Account Status Check**: Only active accounts can login
6. **Email Uniqueness**: Prevents duplicate email registrations

## Database Schema

The `users` table includes:
- `user_id`: Primary key (UUID)
- `first_name`, `last_name`: User names
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (user, advertiser, affiliate, network, admin)
- `status`: Account status (active, inactive, suspended, banned)
- `profile_image_url`: Profile picture URL
- `linkedin_profile`: LinkedIn profile URL
- `identity_verified`: Verification status
- `last_login`: Last login timestamp
- `created_at`, `updated_at`: Timestamps

## Environment Variables

Make sure to set these in your `.env` file:
```
PORT=4100
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
