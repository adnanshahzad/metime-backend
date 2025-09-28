# Metime API

A production-ready NestJS backend with RBAC (Role-Based Access Control) and multi-tenancy support.

## Features

- **NestJS** (latest) with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **RBAC** with roles: `super_admin`, `company_admin`, `member`, `user`
- **Multi-tenancy** with company scoping
- **Winston logging** with correlation IDs
- **Global validation** and exception handling
- **Security** with Helmet and CORS
- **Versioned API** routes (`/v1`)

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/metime
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=15m
   REFRESH_SECRET=your-super-secret-refresh-key-here
   REFRESH_EXPIRES_IN=7d
   NODE_ENV=development
   PORT=3000
   ```

### Seeding

Set up your database with sample data:

```bash
# Insert admin + companies + users (safe to run multiple times)
npm run seed:all

# Drop and recreate all data
npm run seed:refresh
```

This creates:
- **Super Admin**: `admin@example.com` / `ChangeMe123!`
- **Companies**: metime, dts, gohar
- **Company Users** (for each company):
  - Manager: `manager+<company>@example.com` / `ChangeMe123!`
  - Member: `member+<company>@example.com` / `ChangeMe123!`
  - User: `user+<company>@example.com` / `ChangeMe123!`

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/v1`

## API Endpoints

### Authentication
- `POST /v1/auth/login` - Login with email/password
- `POST /v1/auth/register` - Register new user (super_admin only)
- `POST /v1/auth/refresh` - Refresh access token
- `GET /v1/users/me` - Get current user profile

### Users
- `POST /v1/users` - Create user (super_admin, company_admin)
- `GET /v1/users` - List users (scoped by company)
- `GET /v1/users/:id` - Get user by ID
- `PATCH /v1/users/:id` - Update user
- `DELETE /v1/users/:id` - Delete user

### Companies
- `POST /v1/companies` - Create company (super_admin only)
- `GET /v1/companies` - List companies
- `GET /v1/companies/:id` - Get company by ID
- `PATCH /v1/companies/:id` - Update company
- `DELETE /v1/companies/:id` - Delete company (super_admin only)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Architecture

### Project Structure
```
api/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators (@Roles)
│   ├── guards/               # Route guards (RolesGuard, CompanyScopeGuard)
│   ├── filters/              # Exception filters
│   ├── middleware/           # Request middleware (correlation ID)
│   └── interceptors/         # Response interceptors (logging)
├── logging/                  # Winston logging configuration
├── auth/                     # Authentication module
│   ├── dto/                  # Data transfer objects
│   ├── strategies/           # Passport strategies
│   └── guards/               # Auth guards
├── users/                    # Users module
├── companies/                # Companies module
└── seed/                     # Database seeding
```

### Security Features

- **JWT Authentication** with access and refresh tokens
- **Role-based access control** with route-level guards
- **Company scoping** for multi-tenant data isolation
- **Password hashing** with bcrypt
- **Request correlation IDs** for tracing
- **Structured logging** with Winston
- **Global exception handling** with safe error responses

### Logging

All requests are logged with:
- Correlation ID (auto-generated if not provided)
- User ID and Company ID (when authenticated)
- HTTP method, URL, status code
- Response latency
- Full error details (server-side only)

## Development

### Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/metime` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT token expiration | `15m` |
| `REFRESH_SECRET` | Refresh token secret | Required |
| `REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |

## License

This project is licensed under the UNLICENSED License.
