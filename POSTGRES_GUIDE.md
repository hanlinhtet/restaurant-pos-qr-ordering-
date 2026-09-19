# PostgreSQL & Prisma Learning Guide

Welcome to the PostgreSQL and Prisma guide for the POS Ordering System. This guide will help you set up your environment and understand how we interact with the database.

## 1. Installing PostgreSQL

### Windows
- Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/).
- Run the installer and follow the instructions.
- Ensure "PostgreSQL Server" and "pgAdmin 4" are selected.
- Set a password for the `postgres` user.

### macOS
- Use Homebrew: `brew install postgresql@16`
- Start the service: `brew services start postgresql@16`

### Linux (Ubuntu/Debian)
- `sudo apt update`
- `sudo apt install postgresql postgresql-contrib`
- Start the service: `sudo systemctl start postgresql`

---

## 2. Creating a Database

Once installed, you can create a database using the CLI or pgAdmin.

### Using CLI (psql)
1. Open your terminal.
2. Log in: `psql -U postgres`
3. Create database: `CREATE DATABASE pos_ordering_system;`
4. Exit: `\q`

---

## 3. Connecting Prisma

Prisma connects to your database using a connection string in the `.env` file.

### Environment Variable (.env)
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```
Example:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/pos_ordering_system?schema=public"
```

---

## 4. How Migrations Work

Migrations are how you evolve your database schema over time without losing data.

1.  **Modify `schema.prisma`:** Add a new model or field.
2.  **Run Migration:** `npx prisma migrate dev --name init_tables`
    - This generates a SQL file in `prisma/migrations/`.
    - It applies the changes to your local database.
    - It regenerates the Prisma Client.

---

## 5. How Relations Work in Prisma

Prisma makes relations intuitive.

### One-to-Many
A `Business` has many `Branches`.
```prisma
model Business {
  id       String   @id @default(cuid())
  branches Branch[]
}

model Branch {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
}
```

### Many-to-Many
A `User` can belong to many `Businesses` via a join table `BusinessUser`.
```prisma
model User {
  id         String         @id @default(cuid())
  businesses BusinessUser[]
}

model Business {
  id    String         @id @default(cuid())
  users BusinessUser[]
}

model BusinessUser {
  id         String   @id @default(cuid())
  userId     String
  businessId String
  user       User     @relation(fields: [userId], references: [id])
  business   Business @relation(fields: [businessId], references: [id])
}
```

---

## 6. Prisma vs. Raw SQL

### Raw SQL (Traditional)
```sql
SELECT * FROM "Product" WHERE "businessId" = '123' AND "price" > 10;
```

### Prisma (Modern)
```typescript
const products = await prisma.product.findMany({
  where: {
    businessId: '123',
    price: { gt: 10 }
  }
});
```

**Benefits of Prisma:**
- **Type Safety:** Auto-generated types for your models.
- **IntelliSense:** Auto-completion in your IDE.
- **Easier Joins:** Use `include` to fetch related data.
- **Maintainability:** Readable code that describes *what* you want, not just *how* to get it.
