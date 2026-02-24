# Support Ticket Management API

A NestJS backend for a company helpdesk system.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in your values:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=ticket_management_db
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   ```

3. **Create the database** (PostgreSQL must be running):
   ```bash
   createdb ticket_management_db
   # Or via psql:
   psql -U postgres -c "CREATE DATABASE ticket_management_db;"
   ```

4. **Run the app** (auto-creates tables and seeds roles + admin user):
   ```bash
   npm run start:dev
   ```

   The app starts at `http://localhost:3000` and Swagger docs at `http://localhost:3000/docs`.

## Default Admin User

On first startup, the seeder creates a default admin:
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `MANAGER`

Use this to log in and obtain a JWT, then create additional SUPPORT and USER accounts.

## API Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/auth/login` | Public | Login, get JWT |
| POST | `/users` | MANAGER | Create user |
| GET | `/users` | MANAGER | List all users |
| POST | `/tickets` | USER, MANAGER | Create ticket |
| GET | `/tickets` | All auth | Get tickets (role-filtered) |
| PATCH | `/tickets/:id/assign` | MANAGER, SUPPORT | Assign ticket |
| PATCH | `/tickets/:id/status` | MANAGER, SUPPORT | Update ticket status |
| DELETE | `/tickets/:id` | MANAGER | Delete ticket (204) |
| POST | `/tickets/:id/comments` | MANAGER; SUPPORT if assigned; USER if owner | Add comment |
| GET | `/tickets/:id/comments` | Same as above | View comments |
| PATCH | `/comments/:id` | MANAGER or author | Edit comment |
| DELETE | `/comments/:id` | MANAGER or author | Delete comment (204) |

## Authentication

All protected endpoints require: `Authorization: Bearer <token>`

## Status Transitions

`OPEN → IN_PROGRESS → RESOLVED → CLOSED` (sequential only)

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL + TypeORM
- **Auth:** JWT (Passport)
- **Validation:** class-validator
- **Docs:** Swagger UI at `/docs`
