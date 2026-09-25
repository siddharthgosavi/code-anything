---
name: backend-patterns
description: Production backend patterns: REST/GraphQL API design, database connection pooling, indexing, caching with Redis, resilience, and error handling.
---

# Production Backend Architecture Patterns

## 1. Clean Layered Architecture
- **Controller/Handler Layer**: Parse input, validate request schemas, map status codes.
- **Service/Domain Layer**: Business logic, domain invariants, transaction management.
- **Repository/Data Access Layer**: Database queries, ORM/SQL mapping, connection management.

## 2. Database Resilience & Indexing
- Always use connection pooling with explicit max/min limits and connection timeouts.
- Index foreign keys, query filters, and frequently sorted columns.
- Prevent N+1 query patterns: use eager loading, joins, or batching (DataLoader).
- Use database transactions for multi-entity writes.

## 3. Caching Strategy
- Use Cache-Aside pattern for read-heavy entities.
- Set appropriate TTL on all Redis/Memcached keys to avoid memory leaks.
- Implement cache invalidation hooks on updates.

## 4. Error Handling & Observability
- Define domain error hierarchies with standardized HTTP error responses:
  ```json
  {
    "error": {
      "code": "ENTITY_NOT_FOUND",
      "message": "User not found",
      "details": {}
    }
  }
  ```
- Always sanitize error messages returned to clients (never expose raw SQL or internal stack traces).
- Include request tracing IDs across log statements.
