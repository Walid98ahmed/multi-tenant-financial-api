## Plan: Production SaaS Finance Backend (NestJS)

Build a modular-monolith NestJS backend using TypeORM + PostgreSQL + JWT auth, with strict tenancy/authorization checks, DB-level integrity, and production-oriented cross-cutting concerns (validation, centralized errors, logging, env config, seed, Docker). The implementation will follow Controller -> Service -> Repository layering and use SQL aggregation for dashboard metrics.

**Steps**
1. Phase 1 - Foundation and project wiring
2. Install runtime dependencies for config, TypeORM/Postgres, auth (JWT/passport), validation, hashing, and optional logging/rate limiting; add any required dev tooling for migrations and seeding. (*blocks all later steps*)
3. Add global configuration loading/validation from environment variables and wire app bootstrap with global ValidationPipe, global exception filter, and request logging middleware/interceptor. Update startup defaults (port, CORS policy, graceful shutdown hooks). (*depends on 2*)
4. Configure TypeORM for PostgreSQL (data source + module wiring) and enable migration-based schema management for production-safe DB evolution. (*depends on 2; parallel with step 3 where possible*)
5. Phase 2 - Domain modeling and clean module boundaries
6. Create domain modules for users, companies, memberships (join table), transactions, auth, and dashboard; enforce Controller -> Service -> Repository boundaries per module. (*depends on 4*)
7. Implement entities and DB constraints: users, companies, user_companies (role enum OWNER|MEMBER with composite uniqueness), transactions (type enum REVENUE|EXPENSE, money precision, created_at). Add indexes optimized for tenant-scoped lookups and dashboard aggregation. (*depends on 6*)
8. Implement repository layer methods (tenant-aware lookups, membership checks, paginated transaction queries, aggregate queries). Keep complex filtering/aggregation in repositories using query builder/SQL functions rather than in-memory processing. (*depends on 7*)
9. Phase 3 - AuthN/AuthZ and business endpoints
10. Implement auth flows: signup/login with bcrypt hashing, credential verification, JWT issuance (access token), and safe error responses that do not leak sensitive details. (*depends on 6,7*)
11. Add JWT guard + company membership guard/policy checks. Ensure all company-scoped endpoints validate user membership before access, and OWNER-only checks where needed for membership management operations. (*depends on 10; parallel with step 12 after base guards exist*)
12. Implement company endpoints: create company, list user companies, invite/add member (if in scope) or direct attach membership. Ensure creator becomes OWNER automatically. (*depends on 8,11*)
13. Implement transactions endpoints: create transaction and list by company with pagination (page, limit, cursor or offset approach), validation, and tenant isolation checks. (*depends on 8,11*)
14. Implement dashboard endpoint using DB aggregation (SUM with CASE/filter by transaction type) scoped by company and protected by membership checks. (*depends on 8,11*)
15. Phase 4 - Operational readiness and delivery assets
16. Add centralized error shape and HTTP exception mapping; ensure auth and domain errors are normalized and sanitized. (*depends on 3,10-14*)
17. Add seed workflow (idempotent) with sample users/companies/memberships/transactions for quick local validation. (*depends on 7,10-14*)
18. Add Docker support (Dockerfile + compose with Postgres), production-oriented ignore files, and update scripts for migration/seed/start. (*depends on 2,4; parallel with step 17*)
19. Update documentation with full project structure, ERD/schema summary, API routes + sample requests, env examples, run/test/migrate/seed instructions, and key architecture/security decisions + trade-offs. (*depends on all prior steps*)
20. Phase 5 - Verification
21. Execute lint, unit/e2e tests, migration run/revert checks, seed run, and smoke tests for auth, tenancy isolation, transaction pagination, and dashboard totals. (*depends on all implementation phases*)

**Relevant files**
- /home/walid/Downloads/ledgers-saas-backend/package.json - Add dependencies/scripts for db, seed, docker-oriented workflows
- /home/walid/Downloads/ledgers-saas-backend/src/main.ts - Global bootstrap (validation, filters, logging, security middleware)
- /home/walid/Downloads/ledgers-saas-backend/src/app.module.ts - Root module wiring for config/database/domain modules
- /home/walid/Downloads/ledgers-saas-backend/README.md - Delivery docs (routes, envs, setup, design decisions)
- /home/walid/Downloads/ledgers-saas-backend/test/app.e2e-spec.ts - Extend/replace with tenancy/auth/transaction/dashboard e2e coverage

**Verification**
1. Run static checks: lint + TypeScript build.
2. Run migrations against a clean Postgres instance and verify schema objects, FKs, enums, and indexes are created as expected.
3. Run seed command and verify deterministic sample dataset.
4. API smoke tests:
5. Signup/login returns JWT and sanitized error responses for invalid creds.
6. Protected company endpoints reject missing/invalid JWT.
7. User cannot read/write another company's transactions.
8. Transaction listing pagination returns stable metadata and ordering.
9. Dashboard endpoint returns totals matching SQL-verified sums.
10. Run e2e suite and confirm all core flows pass.
11. Validate Docker compose boot (API + Postgres), migration on startup/manual, and reachable health/log outputs.

**Decisions**
- Framework: NestJS chosen over Express for modularity, DI, guards/interceptors, and easier long-term scaling in a modular monolith.
- ORM: TypeORM chosen (per requirement/preference) for entity modeling + migrations; selective QueryBuilder/raw SQL will be used for aggregation-critical queries.
- Auth model: Access-token JWT only for baseline scope; refresh-token rotation is excluded unless explicitly requested.
- Roles: OWNER and MEMBER enforced at membership layer; OWNER-only checks applied to sensitive membership-management actions.
- Transactions currency handling: store amount as DECIMAL in DB and expose as string in API contracts to avoid floating-point precision loss.

**Further Considerations**
1. Pagination style recommendation: offset pagination for MVP simplicity; cursor pagination can be added later if high-volume transaction streams demand better consistency.
2. API docs recommendation: add Swagger/OpenAPI generation to improve consumer onboarding and QA testing.
3. Migration strategy recommendation: disable synchronize in production and rely strictly on checked-in migrations.