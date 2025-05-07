# Tour Management Microservice

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive tour management microservice built with NestJS. This service handles the creation, scheduling, and management of tours.

## Tech Stack

- NestJS framework
- TypeScript
- TypeORM for database interaction
- PostgreSQL database
- Microservice architecture

## Project Structure

```
tour-management/
├─ src/
│  ├─ apis/                # API modules
│  │  ├─ tour/             # Tour module with controller, service, DTOs, and entities
│  │  ├─ address/          # Vehicle module for tour assignment
│  │  ├─ cities/    ...        # Route planning module
│  ├─ core/                # Core functionality
│  │  ├─ common/           # Shared DTOs and utilities
│  │  ├─ db/               # Database configuration and migrations
│  │  ├─ auth/             # Auth client for communication with Auth service
│  │  └─ messaging/        # Message queue clients (if applicable)
│  ├─ app.module.ts        # Main application module
│  └─ main.ts              # Application entry point
```

## Installation

```bash
$ npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432           # Default PostgreSQL port
DB_USERNAME=user       # Your database username
DB_PASSWORD=user       # Your database password
DB_DATABASE=tour_db    # Your database name

# Auth Service Connection
AUTH_SERVICE_URL=auth service url


## Running the Application

```bash
# Development mode
$ npm run start

# Watch mode (auto-reload on changes)
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Database Migrations

```bash
# Generate a migration
$ npm run migration:generate

# Run migrations
$ npm run migration:run
```

## Testing

```bash
# Unit tests
$ npm run test

# End-to-end tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Integration with Vehicle Agency System

This microservice is responsible for managing tours within the Vehicle Agency System. It works in conjunction with other microservices:

- **Auth Service**: Provides authentication and authorization for secure operations
- **Tour Service**: Manages tour and availability
- **Booking Service**: Handles customer information and bookings
- **Notification Service**: Sends updates about tour status changes

## Authentication Integration

All protected endpoints in this service require a valid JWT token that can be obtained from the Auth Service. To make authenticated requests:

1. Obtain a token from the Auth Service (`/auth/validate`)
   For full API documentation, run the application and visit `/api-docs` (if Swagger yet to be configured [upcoming]).
