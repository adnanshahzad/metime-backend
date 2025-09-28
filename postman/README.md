# MeTime API - Postman Collection

This directory contains the Postman collection for the MeTime API, which provides a comprehensive set of requests to test all API endpoints.

## Files

- `MeTime-API.postman_collection.json` - The main Postman collection file
- `MeTime-API.postman_environment.json` - Environment variables for different environments

## Import Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select `MeTime-API.postman_collection.json`
4. Click "Import"

### 2. Import the Environment (Optional)

1. In Postman, click the gear icon (⚙️) in the top right
2. Click "Import"
3. Select `MeTime-API.postman_environment.json`
4. Click "Import"
5. Select the imported environment from the environment dropdown

## Usage

### Authentication

The API uses JWT Bearer token authentication. To use the collection:

1. **Login first**: Use the `POST /auth/login` endpoint to get your JWT token
2. **Set the token**: Copy the `accessToken` from the login response
3. **Update environment**: Set the `jwt_token` variable in your environment to the access token
4. **Use protected endpoints**: All other endpoints will automatically use the JWT token

### Environment Variables

The collection uses the following environment variables:

- `base_url`: The base URL of your API (default: `http://localhost:3000`)
- `jwt_token`: Your JWT access token (set after login)

### API Endpoints

The collection is organized into the following folders:

#### 🔐 Authentication (`auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user (Super Admin only)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

#### 👥 Users (`users`)
- `POST /users` - Create new user
- `GET /users` - Get all users (with optional role filter)
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### 🏢 Companies (`companies`)
- `POST /companies` - Create new company (Super Admin only)
- `GET /companies` - Get all companies
- `GET /companies/:id` - Get company by ID
- `PATCH /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company (Super Admin only)

#### 🏠 Root (`root`)
- `GET /` - Get API information
- `GET /health` - Health check

### Role-Based Access Control

The API implements role-based access control with the following roles:

- **SUPER_ADMIN**: Full access to all resources
- **COMPANY_ADMIN**: Access to company-scoped resources
- **MEMBER**: Limited access to own resources

### Example Workflow

1. **Start the server**: `npm run start:dev`
2. **Login**: Use the login endpoint with valid credentials
3. **Set token**: Copy the access token to your environment
4. **Test endpoints**: Use any of the protected endpoints

### Testing Different Scenarios

The collection includes example request bodies for all endpoints. You can:

1. **Modify request bodies** to test different scenarios
2. **Change environment variables** to test different environments
3. **Use the collection runner** to run automated tests

### Troubleshooting

#### Common Issues

1. **401 Unauthorized**: Make sure you're logged in and the JWT token is set
2. **403 Forbidden**: Check if your user has the required role for the endpoint
3. **404 Not Found**: Verify the endpoint URL and that the server is running

#### Server Not Running

If you get connection errors:
1. Make sure the server is running: `npm run start:dev`
2. Check the server is accessible at `http://localhost:3000`
3. Verify the `base_url` environment variable is correct

### Generating New Collection

To regenerate the Postman collection after API changes:

1. Start the server: `npm run start:dev`
2. Run the generator: `npm run generate:postman`
3. The new collection will be created in the `postman/` directory

## Swagger Documentation

You can also view the API documentation in Swagger UI at:
- **Local**: http://localhost:3000/api/docs
- **JSON Spec**: http://localhost:3000/api/docs-json
