# CLO Polibatam

Short description of what this project does and who it's for. Replace this
paragraph with a real overview: the problem it solves, the tech stack (e.g.
frontend framework, backend framework, database), and any relevant links
(design docs, staging URL, etc).

## Contributors

- L Azlan Rafar (https://github.com/lazlanrafar)
- Kenny Aragon Siahaan (https://github.com/aragonken)
- Sakila Ananda Putri (https://github.com/sakila161105)

## Project Structure

```
.
├── frontend/          # Frontend application
├── backend/           # Backend API
└── docker-compose.yml # Local database & Redis setup
```

## Getting Started

### 1. Environment Setup

Before running or building, you need to set up environment variables for
both the frontend and backend.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Then open each `.env` file and fill in the required values (database URL,
Redis URL, API keys, ports, etc).

### 2. Database & Redis (optional)

If you don't already have PostgreSQL and Redis running locally, you can
spin them up with Docker Compose:

```bash
docker compose up -d
```

This will start the database and Redis containers in the background. Make
sure the connection details in your `.env` files match the values defined
in `docker-compose.yml`.

To stop the containers:

```bash
docker compose down
```

## Running in Development

### Backend

```bash
cd backend
npm install
npm run prisma:push
npm run prisma:seed
npm run dev
```

`prisma:push` syncs your Prisma schema with the database, so make sure the
database container is up (see [Database & Redis](#2-database--redis-optional))
and your `.env` is configured before running it. `prisma:seed` populates the
database with initial/seed data.
    
> **Note:** Make sure `NODE_ENV` is set to `development` in `backend/.env`
> before running the dev server.

### Frontend

```bash
cd frontend
npm install --force
npm run dev
```

## Building for Production

### Backend

```bash
cd backend
npm install
npm run prisma:push
npm run build
```

### Frontend

```bash
cd frontend
npm install --force
npm run build
```

Build output will be located in each folder's respective `dist` or `build`
directory (adjust based on your actual tooling).