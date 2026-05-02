# Ledgers SaaS Backend

Production-grade NestJS backend for a multi-company financial SaaS platform.

## Stack

- Node.js + NestJS
- PostgreSQL
- TypeORM (entities + migrations)
- JWT authentication
- Swagger/OpenAPI for dynamic API testing

## Architecture

Modular monolith with clean layering:

1. Controller: HTTP transport and request/response contracts
2. Service: business rules and authorization checks
3. Repository: TypeORM data access and query optimization

Cross-cutting concerns:

- DTO validation using class-validator
- Global exception filter for consistent error shape
- Request logging middleware
- Environment validation with Joi

## Project Structure

```text
src/
  auth/
  common/
    decorators/
    enums/
    filters/
    interfaces/
    middleware/
  companies/
  config/
  dashboard/
  database/
    migrations/
    data-source.ts
    seed.ts
  memberships/
  transactions/
  users/
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
```

## Database Schema

Core tables:

1. users
2. companies
3. user_companies (join table with role)
4. transactions

### SQL Summary

```sql
users (
  id uuid pk,
  email unique,
  password_hash,
  name,
  created_at,
  updated_at
)

companies (
  id uuid pk,
  name,
  created_at,
  updated_at
)

user_companies (
  user_id uuid fk -> users.id on delete cascade,
  company_id uuid fk -> companies.id on delete cascade,
  role enum('OWNER','MEMBER'),
  created_at,
  primary key(user_id, company_id)
)

transactions (
  id uuid pk,
  company_id uuid fk -> companies.id on delete restrict,
  created_by_user_id uuid fk -> users.id on delete set null,
  amount numeric(14,2),
  type enum('REVENUE','EXPENSE'),
  description,
  created_at
)
```

Indexes:

- users(email) unique
- companies(name)
- user_companies(user_id)
- user_companies(company_id)
- transactions(company_id)
- transactions(company_id, created_at desc)
- transactions(company_id, type)

## Security Model

- Auth endpoints issue JWT access tokens.
- All company-scoped endpoints require bearer token.
- Membership checks enforce tenant isolation.
- OWNER role is required to add/update company members.
- Login errors do not leak whether email or password is invalid.

## API Endpoints

Base URL: `http://localhost:3000/api`

Swagger UI: `http://localhost:3000/api/docs`

### Auth

1. `POST /auth/signup`
2. `POST /auth/login`

Signup sample:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "VeryStrongPassword123",
    "name": "Acme Owner"
  }'
```

### Companies

1. `POST /companies`
2. `GET /companies`
3. `POST /companies/:companyId/members` (OWNER only)

### Transactions

1. `POST /companies/:companyId/transactions`
2. `GET /companies/:companyId/transactions?page=1&limit=20&type=REVENUE`

### Dashboard

1. `GET /companies/:companyId/dashboard`

Returns:

```json
{
  "totalRevenue": "16200.00",
  "totalExpenses": "3500.00"
}
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values.

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ledgers_saas
DB_SYNCHRONIZE=false
DB_LOGGING=false
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=12
```

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Run PostgreSQL locally and prepare `.env`.

3. Run migrations:

```bash
npm run migration:run
```

4. Seed sample data:

```bash
npm run seed
```

5. Start server:

```bash
npm run start:dev
```

## Docker Run

1. Create `.env` from `.env.example`.
2. Start full stack:

```bash
docker compose up --build
```

This runs migration + seed before starting the API.

## Testing and Validation

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

## Design Trade-offs

1. NestJS over Express: stronger module boundaries, DI, and guard/filter ecosystem for scaling teams.
2. TypeORM over raw SQL: faster domain modeling and migration workflows; query builder/raw SQL used where aggregation performance matters.
3. Offset pagination: simple and practical for MVP transaction listing; cursor pagination can be added later for very high write volume.
