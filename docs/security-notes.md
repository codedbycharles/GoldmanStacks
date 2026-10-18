# Security Notes

GoldmanStacks is a demo life cover calculator.

## Authentication

- User passwords are hashed using bcrypt with a cost factor of 12.
- Protected API endpoints require a valid JWT.
- Invalid login attempts return a generic authentication error.
- Login uses a dummy bcrypt hash for unknown users to reduce timing differences between successful and unsuccessful account lookups.

## Authorisation

Quotes belong to individual users.

The quote repository retrieves records using both the quote ID and authenticated user ID.

This prevents users from accessing another user's quotes by supplying a different quote identifier.

Requests for another user's quotes return HTTP 404.

## HTTP Security

Helmet adds security-related HTTP response headers.

CORS allows the configured frontend origin to access the API from a browser.

CORS does not replace authentication or authorisation.

Registration and login endpoints are rate limited to reduce repeated credential guessing and automated account enumeration attempts.

The current rate limiter uses in-memory storage. A multi-instance production deployment would require shared rate-limit storage and correct reverse-proxy configuration.

## Known Limitations

Registration currently returns HTTP 409 if an email address is already registered.

This provides clear API feedback but can reveal whether an account exists.

A production application could use an email-verification flow and generic registration responses to reduce this information exposure.

The JWT implementation is deliberately simple. Production requirements would also include decisions around token storage, revocation, refresh tokens and account recovery.

## Database Migrations

Database schema changes are managed through version-controlled Prisma migrations.

Migrations are applied in CI using `prisma migrate deploy`.

For production systems, potentially destructive schema changes should be reviewed carefully and preceded by appropriate backups.

Fix-forward migrations are preferable to automatic destructive rollbacks, since reversing a schema change does not necessarily restore deleted data.
