# MehrLink Architecture

MehrLink is a production-minded hackathon MVP for an Uzbek social-impact platform. It uses a modern full-stack monorepo architecture.

## System Components

### 1. Frontend (`apps/web`)
- **Framework:** React with Vite.
- **Language:** TypeScript.
- **Responsibility:** User interface, client-side routing, state management, and rendering data from the API.

### 2. Backend API (`apps/api`)
- **Framework:** Node.js with Express.
- **Language:** TypeScript.
- **Database ORM:** Prisma ORM.
- **Responsibility:** Handling RESTful API requests, business logic (donation management, volunteer task allocation), authentication, authorization, and database interactions.

### 3. Shared Library (`packages/shared`)
- **Language:** TypeScript.
- **Responsibility:** Shared DTOs, Zod validation schemas, and common TypeScript types to ensure strict typing across the frontend and backend.

### 4. Database
- **Engine:** PostgreSQL.
- **Responsibility:** Relational data storage enforcing constraints, relationships, and transactional integrity.

## Monorepo Strategy
- Managed via npm workspaces (or yarn/pnpm depending on package manager choice).
- Standardized `package.json` configurations allowing isolated builds while sharing dependencies when applicable.

## Database Design Highlights
- **Role-based Access Control:** Differentiated capabilities for basic users, volunteers, and admins.
- **Status Workflows:** Explicit state machines (enums) for Donations, Assistance Requests, Claims, and Volunteer Tasks.
- **Precision:** Financial values are stored as `Decimal` to avoid floating-point inaccuracies.
- **Auditability:** `ActivityLog` entries record important state changes for tracking and transparency.
- **Soft Deletes / Safe Removal:** Instead of cascading deletes directly, soft-deletion strategies and appropriate index optimization are prioritized for production readiness.
