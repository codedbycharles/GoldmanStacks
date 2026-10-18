# The Backend

[These are some simple notes that might be useful for someone to understand the backend]
[Last updated 9th June 2026]

The current backend is a TypeScript/Node.js/Express.js API.

GoldmanStacks is a mock life cover calculator. Users will be able to register, login, enter financial details and generate a simple life cover reccomendation.

Currently the backend supports:

- Health check
- Environment validation
- Postgres set up through docker
- Prisma DB set up
- User model
- JWT auth
- Endpoints for /login, /register and /me

## Folder structure

- `routes/` maps URL paths to controllers
- `controllers/` handles request/response logic
- `services/` contains app logic
- `repositories/` handles database queries
- `schemas/` contains Zod validation schemas
- `middleware/` contains reusable Express middleware
- `config/` contains app configuration

## Flow

HTTP req ➡️ Express app ➡️ Route ➡️ Controller ➡️ Service ➡️ Repository ➡️ Prisma ➡️ Postgres (on docker)

/server.ts

- Imports express app and validated environment variables and listens on desired port.

/app.ts

- Creates Express app and mounts routes.

/config/env.ts

- env variables are loaded and validated using dotenv and zod.
- rest of the app can then import validared env from this file

## Prisma

Prisma is used as the database ORM.

/prisma/schema.prisma

- defines the DB models

/prisma.config.ts

- Identifies where the schema is, what DB to use and where migrations live

/config/prisma.ts

- Creates the resuable prisma client (app imports this client whenever it needs to query the DB)
- Adapter required in Prisma 7 to let standard JS drivers handle the database network layer instead of native binaries.

## Docker

Docker probably isn't needed for an app of this size, but it is useful as it avoids directly installing Postgres on machine & makes local DB set up reproducible.

## Auth flow

Register:

1. Request hits `/auth/register`
2. Controller validates body with Zod
3. Service checks if email already exists
4. Password is hashed with bcrypt
5. User is saved through Prisma
6. JWT is returned with a safe user object

Login:

1. Request hits `/auth/login`
2. Controller validates body with Zod
3. Service finds user by email
4. bcrypt compares submitted password with stored hash
5. JWT is returned if valid

Me:

1. Request hits `/auth/me`
2. Auth middleware checks `Authorization: Bearer <token>`
3. JWT is verified
4. User ID is attached to the request
5. Controller returns the current user

## Password handling

Passwords are not stored directly, during registration the password is hashed with bcrypt then the hash is saved in Postgres.

When logging in bcrypt compares the submitted password against the stored hash.
