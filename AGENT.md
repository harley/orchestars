# AGENT.md - Orchestars VN Development Guide

## Product Context
OrcheSTARS is a Vietnamese event ticketing platform with multi-channel check-in, zone-based pricing, ZaloPay/bank transfer payments, and Vietnamese/English language support.

## Build & Test Commands
- `pnpm dev` - Start development server (Next.js + PayloadCMS with turbo)
- `pnpm build` - Production build
- `pnpm lint` / `pnpm lint:fix` - ESLint with Next.js rules
- `pnpm test` / `pnpm test:watch` - Vitest unit tests
- `pnpm test:e2e` - Playwright e2e tests
- `pnpm test:coverage` - Generate test coverage
- `pnpm migrate` / `pnpm migrate:create` - Database migrations
- `pnpm run generate:types` - Generate PayloadCMS TypeScript types

## Architecture
Next.js 15 + PayloadCMS 3.44 + PostgreSQL stack. Key App Router structure:
- `(checkin)/` - Staff check-in interface (QR scan, paper entry, manual search)
- `(frontend)/` - Public customer pages
- `(payload)/` - Admin CMS interface
- `(user)/` - User account management
- `src/collections/` - PayloadCMS models (Events, Orders, Tickets, CheckInRecords)
- `src/components/ui/` - Shadcn/UI components

## Code Style & Conventions
- Single quotes, no semicolons, 100 char limit (Prettier)
- Prefix unused vars with `_` (ESLint rule)
- Path aliases: `@/*` for src, `@payload-config` for config
- TypeScript strict mode + `noUncheckedIndexedAccess`
- Server components by default, mark client with `'use client'`
- File naming: `page.tsx`, `Component.client.tsx`, `route.ts`
- Tailwind CSS utility-first styling
