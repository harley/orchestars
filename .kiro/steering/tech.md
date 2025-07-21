# Technology Stack

## Core Framework
- **Next.js 15.3.5**: App Router with server components, API routes, and SSR
- **PayloadCMS 3.44.0**: Headless CMS for content management and admin interface
- **TypeScript 5.7.3**: Strict type checking with path aliases (`@/*`)
- **PostgreSQL**: Primary database via `@payloadcms/db-postgres`

## Frontend
- **React 19.1.0**: Latest React with concurrent features
- **Tailwind CSS 3.4.17**: Utility-first styling with custom design system
- **Radix UI**: Accessible component primitives
- **Shadcn/UI**: Pre-built component library
- **Lexical**: Rich text editor for content management

## Backend & Infrastructure
- **Vercel**: Deployment platform with edge functions
- **Sentry**: Error monitoring and performance tracking
- **Resend/Nodemailer**: Email delivery systems
- **Sharp**: Image processing and optimization

## Package Management
- **pnpm 9.15.5**: Fast, disk space efficient package manager
- **Node.js 22.14.0**: Required runtime version

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server with turbo
pnpm build                  # Production build
pnpm start                  # Start production server

# Database
pnpm migrate               # Run migrations
pnpm migrate:create        # Create new migration
pnpm generate:types        # Generate TypeScript types

# Code Quality
pnpm lint                  # Run ESLint
pnpm lint:fix             # Fix linting issues

# Testing
pnpm test                  # Run unit tests (Vitest)
pnpm test:e2e             # Run Playwright e2e tests
pnpm test:coverage        # Generate coverage report

# Utilities
pnpm reinstall            # Clean install dependencies
pnpm generate:importmap   # Generate import map
```

## Development Patterns
- Server components by default, client components marked with `'use client'`
- Path aliases: `@/` maps to `src/`
- Strict TypeScript with `noUncheckedIndexedAccess`
- ESLint with Next.js and TypeScript rules
- Turbopack for fast development builds