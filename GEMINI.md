# POS Ordering System - Enterprise Multi-Tenant SaaS Architecture

This document outlines the architectural principles, standards, and structure for the POS Ordering System.

## 1. Architectural Overview

### Core Principles
- **Multi-Tenancy:** Strict data isolation using `businessId` and `branchId`.
- **Modular Monolith:** Domain-driven design within a single Next.js application to balance simplicity and scalability.
- **Type Safety:** End-to-end TypeScript with Zod for runtime validation.
- **Clean Architecture:** Separation of UI (Components), Business Logic (Hooks/Actions), and Data Access (Services/Prisma).

### Layer Structure
1.  **Presentation Layer:** Next.js Pages (App Router), React Components (shadcn/ui), Tailwind CSS.
2.  **Domain Layer:** Custom hooks, Zustand stores, and domain-specific logic.
3.  **Application Layer:** Server Actions for mutations and API Routes for complex integrations.
4.  **Infrastructure Layer:** Prisma ORM, PostgreSQL, External Services (Payments, Cloudinary).

---

## 2. Modular Folder Structure

The project follows a domain-based modular structure inside `src/modules`.

```text
src/
├── app/                  # Next.js App Router (Routes & Layouts)
├── components/           # Shared UI components (shadcn/ui, icons)
├── lib/                  # Shared utilities (prisma, utils, config)
├── hooks/                # Global hooks (use-toast, etc.)
├── types/                # Shared global types
└── modules/              # Domain-specific modules
    ├── auth/             # Authentication & Authorization
    ├── businesses/       # Multi-tenant onboarding & management
    ├── branches/         # Branch-specific settings
    ├── categories/       # Product categories
    ├── products/         # Menu items & variants
    ├── tables/           # Table management & QR generation
    ├── orders/           # Order lifecycle management
    ├── payments/         # Payment processing & transactions
    ├── kitchen/          # KDS (Kitchen Display System)
    ├── queue/            # Cashier/Payment queue
    └── dashboard/        # Analytics & Admin UI
```

### Module Blueprint
Each module in `src/modules/[domain]` contains:
- `components/`: Domain-specific UI components.
- `services/`: Server-side logic and database queries.
- `actions/`: Next.js Server Actions for mutations.
- `hooks/`: Domain-specific React hooks.
- `validations/`: Zod schemas for forms and API.
- `types/`: Domain-specific TypeScript interfaces.
- `utils/`: Domain-specific helper functions.

---

## 3. Database Architecture (Prisma)

### Multi-Tenant Strategy
- Every record that belongs to a tenant MUST include `businessId`.
- Records specific to a physical location MUST include `branchId`.
- Indexes are added on `businessId` and `branchId` for performance and query isolation.

### Core Entities
- `User`: Identity and global profile.
- `Business`: Tenant root.
- `Branch`: Physical location under a business.
- `Category`: Product categorization.
- `Product`: Menu items with pricing and variants.
- `Table`: Physical seating in a branch.
- `Order`: Transactional record with state (PENDING -> COMPLETED).
- `Payment`: Financial transaction linked to an order.

---

## 4. State Management
- **Server State:** Handled by Next.js Server Components and Server Actions.
- **Client State:** Zustand for lightweight, global UI state (e.g., active cart, sidebar state).
- **Form State:** React Hook Form with Zod validation.

---

## 5. Security & Authorization
- **Authentication:** JWT-based or Session-based (clerk/authjs).
- **RBAC (Role-Based Access Control):** Roles: `OWNER`, `MANAGER`, `STAFF`, `KITCHEN`.
- **Row-Level Security (RLS) Simulation:** All queries must explicitly filter by `businessId` derived from the authenticated session.

---

## 6. Coding Standards
- **Naming:** PascalCase for components, camelCase for functions/variables, kebab-case for files.
- **Components:** Functional components with explicit prop types.
- **Server Actions:** All mutations must use Server Actions for security and type safety.
- **Error Handling:** Use a standardized `Result` type or custom error classes for predictable error flows.

---

## 8. Error Handling Strategy
- **Client-Side:** Use `ErrorBoundary` for unexpected crashes and Zod/React Hook Form for validation errors.
- **Server-Side:** Standardized API responses with `{ success: boolean, data?: T, error?: string }`.
- **Global Exceptions:** Implement a global error handler in Next.js `error.tsx` pages.

## 9. Logging Strategy
- **Development:** Use standard `console.log` and `console.error`.
- **Production:** Integrate with services like Sentry for crash reporting and Axiom or Datadog for structured logs.
- **Audit Logs:** Critical actions (payments, order deletions) MUST be logged in the database for auditing purposes.

---

## 10. Security Best Practices
- **Data Isolation:** Every query MUST include a tenant check (`where: { businessId: session.businessId }`).
- **CSRF Protection:** Handled automatically by Next.js Server Actions.
- **Sanitization:** Zod for all inputs to prevent injection and malformed data.
- **Secrets:** Use `.env` and never commit secrets to the repository.
