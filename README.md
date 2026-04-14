# Voucher Core API

Backend test assignment: a REST API for managing promo codes and activating them by user email.

This project is built with `Node.js`, `TypeScript`, `NestJS`, `Prisma`, and `PostgreSQL`.

## 📌 Overview

The API provides:

- promo code creation
- promo code retrieval by ID
- promo code listing with optional pagination
- promo code update
- promo code deletion
- promo code activation by email
- activation email lookup by promo code

Each activation links a promo code to a specific email address and enforces the core business rules from the assignment.

## ✨ Features

- REST API with Swagger UI
- PostgreSQL persistence
- Prisma schema and migrations
- DTO validation with `class-validator`
- unified success/error response format
- Docker Compose setup for the database
- activation flow protected against duplicate activation per email
- activation history lookup for a specific promo code

## 🧰 Tech Stack

- `Node.js`
- `TypeScript`
- `NestJS`
- `Prisma ORM`
- `PostgreSQL`
- `Docker Compose`

## 📁 Project Structure

```text
src/
  common/             # filters and interceptors
  prisma/             # Prisma service/module
  promo-codes/        # controller, service, repository, DTOs
prisma/
  migrations/         # database migrations
  schema.prisma       # Prisma schema
test/
  app.e2e-spec.ts     # e2e test entry
docker-compose.yml    # local PostgreSQL container
```

## ✅ Business Rules

- A promo code has:
  - `code`
  - `discountPercentage`
  - `activationLimit`
  - `expirationDate`
- A promo code can be activated only before its expiration date.
- The same email cannot activate the same promo code more than once.
- A promo code cannot be activated beyond its activation limit.
- Promo code list supports explicit pagination via query parameters.

## ⚙️ Prerequisites

Before running the project, make sure you have:

- `Node.js` 20+ recommended
- `npm`
- `Docker` with Docker Compose support

## 🐳 Quick Start

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd VoucherCore
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Default local configuration:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5489/voucher_core?schema=public"
PORT=3000
```

### 3. Start PostgreSQL in Docker

```bash
docker compose up -d
```

Note:

- Docker Compose in this project starts the PostgreSQL database only.
- The NestJS API itself runs locally via `npm` scripts.

This starts a PostgreSQL 15 container on:

- host: `localhost`
- port: `5489`
- database: `voucher_core`
- user: `postgres`
- password: `password`

To stop the database:

```bash
docker compose down
```

### 4. Install dependencies

```bash
npm install
```

### 5. Apply database migrations

```bash
npx prisma migrate deploy
```

### 6. Start the API

Development mode:

```bash
npm run start:dev
```

The API will be available at:

- Base URL: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Swagger UI: [http://127.0.0.1:3000/api/docs](http://127.0.0.1:3000/api/docs)

## 📚 Swagger / API Docs

Swagger is enabled in the project and available at:

[http://127.0.0.1:3000/api/docs](http://127.0.0.1:3000/api/docs)

How to use it:

1. Open the Swagger page in your browser.
2. Expand any endpoint you want to try.
3. Click `Try it out`.
4. Fill in query params, path params, or request body.
5. Click `Execute`.
6. Inspect the response body, status code, and generated `curl` command.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/promo-codes` | Create a promo code |
| `GET` | `/promo-codes` | List promo codes |
| `GET` | `/promo-codes/code/:code/activations` | Get emails that activated a promo code |
| `GET` | `/promo-codes/:id` | Get promo code by UUID |
| `PATCH` | `/promo-codes/:id` | Update promo code |
| `DELETE` | `/promo-codes/:id` | Delete promo code |
| `POST` | `/promo-codes/:code/activate` | Activate a promo code for an email |

## 🧾 Request Examples

### Create promo code

```bash
curl -X POST 'http://127.0.0.1:3000/promo-codes' \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "SUMMER2026",
    "discountPercentage": 10.5,
    "activationLimit": 100,
    "expirationDate": "2026-12-31T23:59:59.000Z"
  }'
```

### List promo codes

```bash
curl 'http://127.0.0.1:3000/promo-codes'
```

### List promo codes with pagination

```bash
curl 'http://127.0.0.1:3000/promo-codes?page=1&limit=10&paginate=true'
```

### List all promo codes without pagination

```bash
curl 'http://127.0.0.1:3000/promo-codes?paginate=false'
```

### Get promo code by ID

```bash
curl 'http://127.0.0.1:3000/promo-codes/<promo-code-id>'
```

### Get activation emails for a promo code

```bash
curl 'http://127.0.0.1:3000/promo-codes/code/SUMMER2026/activations'
```

### Update promo code

```bash
curl -X PATCH 'http://127.0.0.1:3000/promo-codes/<promo-code-id>' \
  -H 'Content-Type: application/json' \
  -d '{
    "discountPercentage": 15,
    "activationLimit": 50
  }'
```

### Activate promo code

```bash
curl -X POST 'http://127.0.0.1:3000/promo-codes/SUMMER2026/activate' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com"
  }'
```

### Delete promo code

```bash
curl -X DELETE 'http://127.0.0.1:3000/promo-codes/<promo-code-id>'
```

## 📨 Request Payloads

### `POST /promo-codes`

```json
{
  "code": "SUMMER2026",
  "discountPercentage": 10.5,
  "activationLimit": 100,
  "expirationDate": "2026-12-31T23:59:59.000Z"
}
```

### `PATCH /promo-codes/:id`

All fields are optional:

```json
{
  "code": "WINTER2026",
  "discountPercentage": 15,
  "activationLimit": 50,
  "expirationDate": "2026-12-31T23:59:59.000Z"
}
```

### `POST /promo-codes/:code/activate`

```json
{
  "email": "user@example.com"
}
```

## 📦 Response Format

Successful responses are wrapped in a common envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {}
}
```

Error responses follow this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2026-04-12T10:00:00.000Z",
  "path": "/promo-codes"
}
```

## 🛠 Useful Commands

```bash
# start NestJS in watch mode
npm run start:dev

# start NestJS normally
npm run start

# build project
npm run build

# start compiled app
npm run start:prod

# lint project
npm run lint

# run tests
npm run test

# run e2e tests
npm run test:e2e
```

## 🗄 Database Notes

- The project uses `docker-compose.yml` to start PostgreSQL locally.
- Data is persisted using a Docker volume: `postgres_data`.
- Prisma schema lives in `prisma/schema.prisma`.

## 📝 Submission Notes

This repository contains:

- backend API only
- no authentication
- no frontend
- local development setup

That matches the original test assignment scope.
