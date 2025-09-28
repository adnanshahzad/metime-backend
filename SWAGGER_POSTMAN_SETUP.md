# Swagger & Postman Setup - Complete Implementation

This document provides a comprehensive overview of the Swagger documentation and Postman collection implementation for the MeTime API.

## 🎯 What Was Implemented

### 1. Swagger/OpenAPI Documentation
- ✅ **Swagger UI**: Interactive API documentation at `/api/docs`
- ✅ **OpenAPI JSON**: Machine-readable spec at `/api/docs-json`
- ✅ **JWT Authentication**: Bearer token support in Swagger UI
- ✅ **Comprehensive Documentation**: All endpoints, DTOs, and responses documented

### 2. Postman Collection
- ✅ **Complete Collection**: All API endpoints with proper structure
- ✅ **Authentication Setup**: JWT Bearer token configuration
- ✅ **Environment Variables**: Configurable base URL and tokens
- ✅ **Example Requests**: Pre-filled request bodies for testing
- ✅ **Organized Structure**: Endpoints grouped by functionality

## 📁 Files Created/Modified

### New Files
```
scripts/
├── generate-postman.js          # Postman collection generator
└── test-api.js                  # API testing script

postman/
├── MeTime-API.postman_collection.json    # Main Postman collection
├── MeTime-API.postman_environment.json   # Environment variables
└── README.md                             # Postman usage guide

SWAGGER_POSTMAN_SETUP.md                  # This documentation
```

### Modified Files
```
api/main.ts                      # Added Swagger configuration
api/auth/auth.controller.ts       # Added Swagger decorators
api/users/users.controller.ts     # Added Swagger decorators
api/companies/companies.controller.ts # Added Swagger decorators
api/root/root.controller.ts       # Added Swagger decorators

api/auth/dto/*.ts                # Added ApiProperty decorators
api/users/dto/*.ts               # Added ApiProperty decorators
api/companies/dto/*.ts           # Added ApiProperty decorators

package.json                     # Added new scripts
```

## 🚀 How to Use

### Swagger Documentation

1. **Start the server**:
   ```bash
   npm run start:dev
   ```

2. **Access Swagger UI**:
   - Open: http://localhost:3000/api/docs
   - Interactive documentation with "Try it out" functionality
   - JWT authentication support

3. **Access OpenAPI JSON**:
   - Open: http://localhost:3000/api/docs-json
   - Machine-readable specification

### Postman Collection

1. **Import Collection**:
   - Open Postman
   - Import: `postman/MeTime-API.postman_collection.json`
   - Import Environment: `postman/MeTime-API.postman_environment.json`

2. **Set up Authentication**:
   - Use `POST /auth/login` to get JWT token
   - Set `jwt_token` environment variable
   - All protected endpoints will use the token automatically

3. **Test Endpoints**:
   - All endpoints are pre-configured with examples
   - Environment variables for easy switching between environments

## 🛠️ Available Scripts

```bash
# Generate Postman collection (requires running server)
npm run generate:postman

# Test API endpoints
npm run test:api

# Start development server
npm run start:dev
```

## 📋 API Endpoints Documented

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - Register user (Super Admin only)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

### Users (`/users`)
- `POST /users` - Create user
- `GET /users` - Get all users (with role filter)
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Companies (`/companies`)
- `POST /companies` - Create company (Super Admin only)
- `GET /companies` - Get all companies
- `GET /companies/:id` - Get company by ID
- `PATCH /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company (Super Admin only)

### Root (`/`)
- `GET /` - API information
- `GET /health` - Health check

## 🔐 Authentication & Authorization

### JWT Bearer Token
- All protected endpoints require JWT authentication
- Token obtained via `/auth/login` endpoint
- Swagger UI supports "Authorize" button for easy testing
- Postman collection automatically includes Bearer token

### Role-Based Access Control
- **SUPER_ADMIN**: Full access to all resources
- **COMPANY_ADMIN**: Company-scoped access
- **MEMBER**: Limited access to own resources

## 🎨 Features Implemented

### Swagger Features
- ✅ Interactive API documentation
- ✅ Request/response examples
- ✅ Authentication integration
- ✅ Parameter validation
- ✅ Error response documentation
- ✅ Tag-based organization

### Postman Features
- ✅ Complete endpoint coverage
- ✅ Authentication setup
- ✅ Environment variables
- ✅ Example request bodies
- ✅ Organized folder structure
- ✅ Auto-generated from Swagger spec

## 🔄 Regenerating Collection

When you make changes to the API:

1. **Start the server**: `npm run start:dev`
2. **Generate new collection**: `npm run generate:postman`
3. **Import updated collection** into Postman

## 🧪 Testing

Run the test script to verify everything is working:

```bash
npm run test:api
```

This will test:
- ✅ Root endpoint
- ✅ Health check
- ✅ Swagger JSON
- ✅ Swagger UI accessibility

## 📚 Documentation Links

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json
- **Postman Collection**: `postman/MeTime-API.postman_collection.json`
- **Environment File**: `postman/MeTime-API.postman_environment.json`

## 🎉 Summary

The implementation provides:

1. **Complete API Documentation** with Swagger UI
2. **Ready-to-use Postman Collection** with authentication
3. **Automated Generation** of Postman collection from Swagger spec
4. **Comprehensive Testing** scripts
5. **Easy Maintenance** with automated updates

Both Swagger and Postman collections are now fully functional and ready for development and testing!
