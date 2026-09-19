# POS Ordering System

A restaurant point-of-sale and QR ordering system built with Next.js 15, Prisma and PostgreSQL.

Staff manage products, tables, orders, inventory and analytics from a dashboard. Customers scan a QR code on their table, browse the menu on their phone, and place orders that appear on the kitchen screen.

---

## Before you start

You need these installed:

| Tool | Version |
|---|---|
| Node.js | 20 or newer (tested on 22) |
| npm | 10 or newer |
| PostgreSQL | 14 or newer (tested on 16) |

Check what you have:

```bash
node -v
npm -v
psql --version
```

---

## Setup

### 1. Install the dependencies

```bash
npm install --legacy-peer-deps
```

> **The `--legacy-peer-deps` flag is required.** This project uses a release-candidate build of React 19, which npm refuses to install next to one of the UI packages without it. A plain `npm install` will fail with an `ERESOLVE` error.

### 2. Create the database

Log into PostgreSQL as an admin user:

```bash
sudo -u postgres psql
```

Then run these four lines:

```sql
CREATE USER pos_user WITH PASSWORD 'pos123';
CREATE DATABASE pos_ordering_system OWNER pos_user;
GRANT ALL PRIVILEGES ON DATABASE pos_ordering_system TO pos_user;
\q
```

You can pick a different username and password — just make sure the `.env` file in the next step matches.

### 3. Create your `.env` file

Copy the example:

```bash
cp .env.example .env
```

Open `.env` and set two things:

**`DATABASE_URL`** — must match the user, password and database you just created:

```env
DATABASE_URL="postgresql://pos_user:pos123@localhost:5432/pos_ordering_system?schema=public"
```

**`AUTH_SECRET`** — generate a real random value, don't leave the placeholder:

```bash
openssl rand -base64 32
```

Paste the output into `.env`:

```env
AUTH_SECRET="the-random-string-you-just-generated"
```

### 4. Create the database tables

```bash
npx prisma migrate deploy
```

This applies all the migrations in `prisma/migrations/` and builds the schema. It should finish in a few seconds.

### 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**.

---

## First run

The database starts empty — there is no seed data and no default login, so you create the first account yourself.

1. Go to **http://localhost:3000/register** and sign up.
2. You'll be sent to the onboarding page. Fill in your business and branch details.
3. You land on the dashboard. From here you can add categories, products, tables and staff.
4. Create a table under **Tables** to get its QR code. Scanning it (or opening the link) is how a customer reaches the menu.

If your first account doesn't have owner permissions, promote it:

```bash
node scripts/fix-owner.js your@email.com
```

---

## Handy scripts

```bash
node scripts/list-users.js           # show every user and their role
node scripts/fix-owner.js <email>    # make a user an OWNER
node scripts/fix-roles.js            # promote every business-linked STAFF user to OWNER
npx prisma studio                    # browse and edit the database in your browser
```

---

## Troubleshooting

### `Can't reach database server at localhost:5432`

PostgreSQL isn't running. Start it:

```bash
sudo systemctl start postgresql     # Linux
brew services start postgresql@16   # macOS
```

### `Authentication failed ... credentials for "pos_user" are not valid`

Usually one of two things:

- The username or password in `DATABASE_URL` doesn't match what you created in step 2.
- **Something else is already using port 5432** — another PostgreSQL install, or a Docker container from a different project. Your app then connects to *that* database, which has no `pos_user`, and the login fails.

Check what's on the port:

```bash
ss -ltnp | grep 5432      # Linux
lsof -i :5432             # macOS
docker ps                 # look for containers publishing 5432
```

If a container has taken it, either stop that container or move your PostgreSQL to a free port (5435, for example) and update the port in `DATABASE_URL` to match.

### `npm install` fails with `ERESOLVE` / peer dependency errors

Use `npm install --legacy-peer-deps`, as described in step 1.

### Changes to `.env` don't seem to apply

Next.js reads `.env` at startup. Stop the dev server (`Ctrl+C`) and run `npm run dev` again.

### Port 3000 is already in use

```bash
npm run dev -- -p 3001
```

Then update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` in `.env` to use the same port, and restart.

---

## Project structure

```
prisma/
  schema.prisma       database models
  migrations/         schema history
scripts/              one-off maintenance scripts
src/
  app/
    (auth)/           login and register pages
    (dashboard)/      staff-facing pages
    menu/             customer-facing QR menu
    api/              route handlers
  modules/            feature code (orders, inventory, products, tables, ...)
  components/ui/      shared UI components
  lib/                Prisma client and helpers
```

Each folder under `src/modules/` holds the actions, components and validations for one feature.

---

## Commands

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # lint the code
```

---

## Notes

- `.env` is gitignored on purpose — it holds your database password and auth secret. Never commit it. `.env.example` is the template that is safe to share.
- If you change `prisma/schema.prisma`, create a migration with `npx prisma migrate dev --name describe_your_change`.
