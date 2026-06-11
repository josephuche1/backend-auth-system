# Backend Auth System

A production-style REST API for user authentication and role-based access control, built with **Node.js**, **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**.

Features include JWT access/refresh tokens, bcrypt password hashing, request validation (Zod), rate limiting on auth endpoints, structured error handling, and interactive API documentation via Swagger UI.

---

## Table of contents

*   [Features](#features)
*   [Tech stack](#tech-stack)
*   [Project structure](#project-structure)
*   [Prerequisites](#prerequisites)
*   [Getting started](#getting-started)
*   [Environment variables](#environment-variables)
*   [Database setup](#database-setup)
*   [Running the app](#running-the-app)
*   [Docker](#docker)
*   [API documentation](#api-documentation)
*   [API reference](#api-reference)
*   [Authentication flow](#authentication-flow)
*   [Error responses](#error-responses)
*   [Scripts](#scripts)

---

## Features

*   **User registration and login** with email/password
*   **JWT access tokens** (15-minute expiry) and **refresh tokens** (7-day expiry, stored in DB)
*   **Role-based access control** (`user` and `admin` roles)
*   **Protected routes** via Bearer token middleware
*   **Rate limiting** on `/auth/register` and `/auth/login` (10 requests / 15 min per IP)
*   **Input validation** with Zod schemas
*   **Swagger UI** at `/docs` for interactive API exploration
*   **Docker** support for containerized development and deployment

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Hashing | bcrypt |
| Validation | Zod |
| Docs | swagger-jsdoc + swagger-ui-express |

---

## Project structure

```
backend-auth-system/
├── prisma/
│   ├── schema.prisma          # Database models (User, RefreshToken)
│   └── migrations/            # Prisma migration history
├── src/
│   ├── app.ts                 # Express app setup, routes, Swagger
│   ├── server.ts              # HTTP server entry point
│   ├── config/
│   │   ├── db.ts              # Prisma client singleton
│   │   └── swagger.ts         # OpenAPI spec configuration
│   ├── modules/
│   │   ├── auth/              # Register, login, refresh, logout
│   │   └── user/              # Profile and admin user listing
│   ├── middleware/            # Auth, validation, rate limit, errors
│   ├── validation/            # Zod schemas
│   ├── utils/                 # JWT, password hashing, API responses
│   └── errors/                # Custom error classes
├── Dockerfile
├── prisma.config.ts           # Prisma 6 config (datasource URL)
├── package.json
└── tsconfig.json
```

---

## Prerequisites

*   [Node.js](https://nodejs.org/) 20+
*   [PostgreSQL](https://www.postgresql.org/) database (local or hosted, e.g. Aiven)
*   npm (included with Node.js)
*   [Docker](https://www.docker.com/) (optional, for containerized runs)

---

## Getting started

### 1\. Clone and install

```
git clone <repository-url>
cd backend-auth-system
npm install
```

### 2\. Configure environment

Create a `.env` file in the project root:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=your-long-random-secret-at-least-32-chars
PORT=3000
```

> **Important:** Do not wrap values in quotes when using Docker `--env-file`. Docker passes quoted strings literally, which breaks Prisma URL validation.

### 3\. Set up the database

```
npx prisma migrate deploy
npx prisma generate
```

### 4\. Start the development server

```
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWTs |
| `PORT` | No | HTTP port (default: `3000`) |

Example `DATABASE_URL` formats:

```
# Local
DATABASE_URL=postgres://postgres:password@localhost:5432/auth_db

# Hosted (e.g. Aiven) with SSL
DATABASE_URL=postgres://user:pass@host.aivencloud.com:14410/defaultdb?sslmode=require
```

---

## Database setup

The Prisma schema defines two models:

*   **User** — `id`, `username`, `email`, `passwordHash`, `role` (default: `user`), timestamps
*   **RefreshToken** — stores active refresh tokens with expiry, linked to a user

Apply migrations:

```
# Development (creates migration if schema changed)
npx prisma migrate dev

# Production / CI
npx prisma migrate deploy
```

Open Prisma Studio to inspect data:

```
npx prisma studio
```

---

## Running the app

### Development (with hot reload)

```
npm run dev
```

Uses `nodemon` + `ts-node` to watch TypeScript files and restart automatically.

### Health check

```
curl http://localhost:3000/
```

```
{ "message": "Backend API running 🚀" }
```

---

## Docker

### Build the image

```
docker build -t auth-api .
```

The Dockerfile runs `prisma generate` at build time with a placeholder `DATABASE_URL` (generate does not connect to the database). Real credentials are supplied at runtime.

### Run the container

```
docker run -p 3000:3000 --env-file .env auth-api
```

Or pass variables individually:

```
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret \
  auth-api
```

> `.env` is listed in `.dockerignore` and is **not** copied into the image. Use `--env-file` or `-e` flags to inject secrets at runtime.

---

## API documentation

Interactive Swagger UI is served at:

```
http://localhost:3000/docs
```

The OpenAPI spec is generated from JSDoc annotations in route files and shared schemas in `src/config/swagger.ts`. Use the **Authorize** button in Swagger UI to paste a Bearer access token when testing protected endpoints.

---

## API reference

Base URL: `http://localhost:3000`

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | No | Health check |

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | Log in with email and password |
| POST | `/auth/refresh` | No | Exchange refresh token for new access token |
| POST | `/auth/logout` | No | Revoke a refresh token |

### Users

| Method | Endpoint | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/users/me` | Bearer | any | Get current user profile |
| GET | `/users/users` | Bearer | admin | List all users |

---

### Example requests

#### Register

```
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

**Response (200):**

```
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-06-11T06:40:57.897Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login

```
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

#### Get current user

```
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer <accessToken>"
```

#### Refresh access token

```
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "token": "<refreshToken>" }'
```

#### Logout

```
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "<refreshToken>" }'
```

---

## Authentication flow

```
┌──────────┐     register/login      ┌──────────┐
│  Client  │ ──────────────────────► │   API    │
└──────────┘                         └──────────┘
     │                                     │
     │  ◄── accessToken (15 min)          │
     │  ◄── refreshToken (7 days, in DB)   │
     │                                     │
     │  Authorization: Bearer <accessToken>│
     │ ──────────────────────────────────► │  protected routes
     │                                     │
     │  POST /auth/refresh { token }       │
     │ ──────────────────────────────────► │  new accessToken
     │                                     │
     │  POST /auth/logout { refreshToken } │
     │ ──────────────────────────────────► │  token deleted from DB
```

1.  **Register or login** — receive `accessToken` and `refreshToken`.
2.  **Call protected routes** — send `Authorization: Bearer <accessToken>`.
3.  **When access token expires** — call `POST /auth/refresh` with the refresh token.
4.  **Logout** — call `POST /auth/logout` to revoke the refresh token server-side.

---

## Error responses

Most errors follow this shape:

```
{
  "success": false,
  "message": "Human-readable error message"
}
```

| Status | When |
| --- | --- |
| 400 | Validation failed (invalid email, short password, etc.) |
| 401 | Missing/invalid token or wrong password |
| 403 | Authenticated but insufficient role |
| 404 | User not found |
| 409 | Email already registered |
| 429 | Rate limit exceeded on auth endpoints |
| 500 | Unexpected server error |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with nodemon + ts-node |
| `npm test` | Placeholder (no tests configured yet) |

### Useful Prisma commands

| Command | Description |
| --- | --- |
| `npx prisma migrate dev` | Apply migrations (development) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma generate` | Regenerate Prisma Client |
| `npx prisma studio` | Open database GUI |

---

## License

ISC