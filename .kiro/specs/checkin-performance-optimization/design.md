# Design Document

## Overview

The **Check-in Performance Optimization** project addresses critical performance bottlenecks identified from Vercel observability data, which showed significant response times and CPU throttling under load. The design focuses on immediate, practical optimizations targeting the database and serverless function infrastructure to ensure a smooth check-in experience for an upcoming event.

## Architecture

### Performance Analysis & Bottleneck Identification

Based on Vercel observability stats showing **42K invocations with 1.17s P75 response times and 12.5% CPU throttle**, the primary bottlenecks were identified as:

1.  **Slow Database Queries:** Inefficient text searches (`ILIKE`) for users by email and phone number were causing full table scans.
2.  **Database Connection Inefficiency:** The application was not configured to optimally manage its connection pool, risking connection limit errors under load.
3.  **CPU Throttling:** The serverless functions for the check-in API were under-provisioned, leading to performance degradation during peak traffic.

### Implemented Optimization Strategy

The strategy focused on high-impact, low-risk changes that could be deployed quickly and safely before the event.

```
┌───────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│      Client Device        │      │      Vercel/Payload      │      │     Supabase Database    │
│ (Phone/Laptop)            │      │       (Backend)          │      │                          │
│                           │◄────►│  • Increased Memory/CPU  │◄────►│  • Trigram GIN Indexes   │
│                           │      │  • Optimized Conn. Pool  │      │    (for fast ILIKE)      │
└───────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```

## Implemented Components

### 1. Database Query Optimization (PostgreSQL)

To accelerate search performance, `pg_trgm` GIN indexes were added to the `users` table.

**Migration File:** `src/migrations/*_add_trigram_indexes_for_checkin_search.ts`

```typescript
// The migration enables the pg_trgm extension and creates GIN indexes.
// This allows PostgreSQL to perform highly efficient ILIKE searches.

// 1. Enable the extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

// 2. Create index for fast email searches
CREATE INDEX IF NOT EXISTS idx_users_email_gin 
  ON users USING gin(email gin_trgm_ops);

// 3. Create index for fast phone number searches
CREATE INDEX IF NOT EXISTS idx_users_phone_number_gin 
  ON users USING gin(phone_number gin_trgm_ops);
```

### 2. Database Connection Pooling (Payload CMS)

The Payload CMS database configuration was updated to manage the connection pool efficiently and stay within the limits of the Supabase "Small" plan.

**File:** `src/payload.config.ts`

```typescript
// ...
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URI || '',
    max: 20, // A safe limit to prevent connection exhaustion.
    idleTimeoutMillis: 30000, // Closes idle connections after 30 seconds.
  },
}),
// ...
```

### 3. Vercel Function Configuration

To address CPU throttling and improve overall API responsiveness, the memory allocation for the check-in API serverless functions was increased.

**File:** `vercel.json`

```json
{
  "functions": {
    "src/app/api/checkin-app/**": {
      "maxDuration": 10,
      "memory": 512
    }
  },
  "crons": [
    // ...
  ]
}
```

This design provides a clear record of the immediate, practical performance improvements that were implemented to ensure the stability of the check-in system for the event.