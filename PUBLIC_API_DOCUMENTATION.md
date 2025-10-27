# Public API Endpoints Documentation

## Overview

The public API endpoints provide unauthenticated access to essential functionality for your web application. These endpoints allow customers to browse services, view company information, and register new accounts without requiring authentication.

## Base URL

All public endpoints are prefixed with `/public`:
- `GET /public/services` - Browse available services
- `POST /public/auth/register` - Register new customer
- etc.

## Authentication

**Important**: These endpoints do NOT require authentication. They are designed for public access.

## Endpoints

### Services

#### Get All Active Services
```http
GET /public/services
```

**Query Parameters:**
- `categoryId` (optional): Filter by service category ID
- `minPrice` (optional): Filter by minimum price
- `maxPrice` (optional): Filter by maximum price

**Response:**
```json
[
  {
    "_id": "service_id",
    "name": "Service Name",
    "description": "Service description",
    "price": 100,
    "duration": 60,
    "isActive": true,
    "images": ["image_path"],
    "thumbnails": ["thumbnail_path"],
    "categoryId": {
      "_id": "category_id",
      "name": "Category Name",
      "slug": "category-slug"
    }
  }
]
```

#### Get Service by ID
```http
GET /public/services/:id
```

**Response:** Single service object with full details

#### Get Services by Category
```http
GET /public/services/category/:categoryId
```

**Response:** Array of services in the specified category

### Service Categories

#### Get All Active Service Categories
```http
GET /public/service-categories
```

**Response:**
```json
[
  {
    "_id": "category_id",
    "name": "Category Name",
    "slug": "category-slug",
    "description": "Category description",
    "isActive": true
  }
]
```

#### Get Service Category by ID
```http
GET /public/service-categories/:id
```

**Response:** Single service category object

### Authentication

#### Register New Customer
```http
POST /public/auth/register
```

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe", 
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Customer registered successfully",
  "user": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "customer@example.com",
    "role": "customer",
    "isActive": true
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Customer Login
```http
POST /public/auth/login
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "firstname": "John", 
    "lastname": "Doe",
    "email": "customer@example.com",
    "role": "customer",
    "isActive": true
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid price parameters. Please provide valid numbers for minPrice and maxPrice.",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Service not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## Usage Examples

### Frontend Integration

#### Browse Services
```javascript
// Get all services
const services = await fetch('/api/public/services').then(r => r.json());

// Get services by category
const spaServices = await fetch('/api/public/services/category/spa-services').then(r => r.json());

// Get services with price filter
const affordableServices = await fetch('/api/public/services?maxPrice=100').then(r => r.json());
```

#### Customer Registration
```javascript
const registerCustomer = async (customerData) => {
  const response = await fetch('/api/public/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData)
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store tokens for authenticated requests
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  } else {
    throw new Error('Registration failed');
  }
};
```

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting for public endpoints to prevent abuse
2. **Input Validation**: All inputs are validated using class-validator decorators
3. **Password Security**: Passwords are hashed using bcrypt with 12 salt rounds
4. **CORS**: Configured to allow requests from your frontend domains
5. **Data Exposure**: Only active services, categories, and companies are returned

## Next Steps

After implementing these public endpoints, you can:

1. **Build your frontend** using these endpoints for:
   - Service browsing page
   - Customer registration form
   - Customer login form

2. **Extend functionality** by adding:
   - Service search/filtering
   - Service reviews and ratings
   - Booking requests (authenticated)
   - Customer profile management (authenticated)

3. **Monitor and optimize**:
   - Add caching for frequently accessed data
   - Implement pagination for large datasets
   - Add analytics tracking
