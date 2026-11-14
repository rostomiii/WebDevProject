# Daytime Radio — Backend

Complete Express/Mongoose MVC backend, adapted from the uploaded `server.zip`.

## Setup

1. From `server/`, run `npm install` (generates a fresh `package-lock.json`).
2. Copy `.env.example` to `.env` and enter real MongoDB, JWT and Spotify credentials.
3. Run `npm run dev`.
4. Test `GET http://localhost:3000/`.

## API

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/api/users` | Public registration |
| GET | `/api/users` | Bearer JWT |
| GET | `/api/users/:userId` | Bearer JWT, account owner |
| PUT | `/api/users/:userId` | Bearer JWT, account owner |
| DELETE | `/api/users/:userId` | Bearer JWT, account owner |
| POST | `/api/auth/signin` | Public |
| POST | `/api/auth/signout` | Client discards token (not server revocation) |
| GET | `/api/songs` | Public |
| GET | `/api/songs/search?q=...` | Public, needs Spotify secrets |
| GET | `/api/songs/:id` | Public |
| POST | `/api/songs` | Public (existing behavior; secure before production) |
| PUT | `/api/songs/:id` | Public (existing behavior; secure before production) |
| DELETE | `/api/songs/:id` | Public (existing behavior; secure before production) |

## Example Thunder Client

`POST /api/users` JSON: `{ "name":"Ross", "email":"ross@example.com", "password":"strong-pass-123" }`

`POST /api/auth/signin` JSON: `{ "email":"ross@example.com", "password":"strong-pass-123" }`

Copy the returned `token` and send `Authorization: Bearer <token>` to protected endpoints.

## Compatibility and security notes

- Older accounts using the previous SHA-1 hashes **cannot sign in** with this code. Delete/recreate *test* accounts or implement a secure reset/migration strategy for real users. Back up production data first.
- The old `created` and `updated` fields are replaced by Mongoose `createdAt` and `updatedAt`. Existing historical dates are not automatically migrated.
- Song CRUD is unchanged and currently publicly writable. Add JWT + appropriate role-based authorization before public deployment.
- JWT signout only instructs clients to discard the token. Server-side immediate revocation needs a denylist/session implementation.
- For production, add rate limiting, stricter password rules, secure account management, and tests.
