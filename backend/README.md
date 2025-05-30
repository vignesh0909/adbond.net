# LinkedIn.us Backend API

A robust backend API for LinkedIn.us platform with user authentication, entity management, and offer system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:4100`

## 📋 API Documentation

### User Authentication APIs
Complete user authentication system with signup, login, and profile management.

**Base URL:** `http://localhost:4100/api/users`

#### Available Endpoints:
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile (authenticated)
- `PUT /profile/:id` - Update user profile (authenticated)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID (admin only)
- `DELETE /:id` - Delete user (admin only)

For detailed API documentation, see [USER_API_DOCS.md](./USER_API_DOCS.md)

### Entity Management APIs
Complete entity management system for advertisers, affiliates, and networks.

**Base URL:** `http://localhost:4100/api/entities`

#### Available Endpoints:
- `POST /register` - Register new entity (public)
- `GET /public` - Get approved public entities (public)
- `GET /type/:type` - Get entities by type with pagination (public)
- `GET /` - Get all entities with filters (authenticated)
- `GET /:id` - Get entity by ID (authenticated)
- `PUT /:id` - Update entity (authenticated)
- `PUT /:id/verification` - Update verification status (admin only)
- `DELETE /:id` - Delete entity (admin only)

For detailed API documentation, see [ENTITY_API_DOCS.md](./ENTITY_API_DOCS.md)

## 🔧 Environment Variables

```env
# Server Configuration
PORT=4100
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── controllers/           # Business logic
│   │   ├── userController.js  # User authentication logic
│   │   └── entityController.js # Entity management logic
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # JWT authentication
│   │   └── validation.js     # Input validation
│   ├── models/               # Database models
│   │   ├── db_connection.js  # Database connection
│   │   ├── user.model.pg.js  # User model with auth methods
│   │   ├── entity.model.pg.js # Entity model with CRUD operations
│   │   └── offers.model.pg.js # Offers model
│   └── routes/               # API routes
│       ├── user.router.js    # User authentication routes
│       ├── entity.router.js  # Entity management routes
│       └── offer.router.js   # Offer routes
├── package.json
├── .env
├── USER_API_DOCS.md          # User API documentation
└── ENTITY_API_DOCS.md        # Entity API documentation
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Authentication**: Secure token-based auth with 24h expiration
- **Input Validation**: Comprehensive validation using express-validator
- **Role-based Access Control**: Different access levels (user, admin, etc.)
- **Account Status Management**: Active/inactive/suspended/banned states
- **Email Uniqueness**: Prevents duplicate registrations

## 📊 Database Schema

### Users Table
- `user_id` (UUID, Primary Key)
- `first_name`, `last_name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (ENUM: user, advertiser, affiliate, network, admin)
- `status` (ENUM: active, inactive, suspended, banned)
- `profile_image_url` (VARCHAR)
- `linkedin_profile` (VARCHAR)
- `identity_verified` (BOOLEAN)
- `last_login` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

## 🧪 Testing the APIs

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

### Get profile (replace TOKEN with actual JWT):
```bash
curl -X GET http://localhost:4100/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🛠️ Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Dependencies
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **express-validator** - Input validation
- **pg** - PostgreSQL client
- **uuid** - UUID generation
- **dotenv** - Environment variables
- **morgan** - HTTP request logger

## 📝 Notes

- JWT tokens expire after 24 hours
- All passwords are hashed with bcryptjs (12 salt rounds)
- Input validation is performed on all user inputs
- Database tables are created automatically on server start
- Role-based access control is implemented for admin functions

## 🔄 Next Steps

1. Add email verification for new registrations
2. Implement password reset functionality
3. Add rate limiting for auth endpoints
4. Implement refresh token mechanism
5. Add comprehensive logging and monitoring
6. Add unit and integration tests
