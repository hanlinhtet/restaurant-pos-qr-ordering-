# Project Execution Guide

This guide provides the necessary commands to set up the database and run the POS Ordering System.

## 1. Database Setup (PostgreSQL)

### Option A: Using Docker (Recommended)
If you have Docker installed, you can start a PostgreSQL instance with a single command:

```bash
docker run --name pos-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pos_ordering_system -p 5432:5432 -d postgres
```

### Option B: Local Installation
If you have PostgreSQL installed locally:

```bash
# Log in to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE pos_ordering_system;

# Exit
\q
```

---

## 2. Project Initialization

Once the database is running, follow these steps to initialize the project:

```bash
# 1. Install dependencies (Legacy peer deps required for React 19 RC)
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Open .env and ensure DATABASE_URL matches your setup

# 3. Synchronize Database Schema
npx prisma migrate dev --name init

# 4. Generate Prisma Client
npx prisma generate
```

---

## 3. Running the Application

### Development Mode
Runs the app with hot-reloading:

```bash
npm run dev
```

### Production Mode
Builds and starts the optimized application:

```bash
npm run build
npm run start
```

---

## 4. Useful Commands

- **Prisma Studio:** Visual editor for your database.
  ```bash
  npx prisma studio
  ```
- **Linting:** Check code quality.
  ```bash
npm run lint
  ```


