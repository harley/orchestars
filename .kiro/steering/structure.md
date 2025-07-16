# Project Structure

## Root Directory
- **src/**: Main application source code
- **public/**: Static assets (images, fonts, logos)
- **docs/**: Project documentation and guides
- **tests/**: E2E and integration tests
- **supabase/**: Database configuration and local development

## App Router Structure (`src/app/`)
```
src/app/
├── (checkin)/          # Check-in staff interface
│   └── checkin/
│       ├── events/     # Event selection
│       ├── scan/       # QR code scanning
│       ├── paper/      # Paper ticket entry
│       └── validates/  # Manual search
├── (frontend)/         # Public customer-facing pages
├── (payload)/          # Admin CMS interface
├── (user)/            # User account pages
├── (affiliate)/       # Affiliate system
└── api/               # API routes and endpoints
```

## Core Application Structure (`src/`)
```
src/
├── collections/        # PayloadCMS data models
│   ├── Events/        # Event management
│   ├── Orders/        # Order processing
│   ├── Tickets/       # Ticket generation
│   ├── CheckInRecords/ # Check-in tracking
│   └── Users/         # User management
├── components/        # Reusable React components
│   ├── ui/           # Shadcn/UI components
│   ├── Admin/        # Admin interface components
│   └── CheckInResult/ # Check-in specific components
├── blocks/           # PayloadCMS content blocks
├── config/           # Application configuration
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── providers/        # React context providers
├── utilities/        # Helper functions
└── migrations/       # Database migrations
```

## Key Conventions

### File Naming
- **Server components**: `page.tsx`, `layout.tsx`
- **Client components**: `page.client.tsx`, `Component.client.tsx`
- **API routes**: `route.ts` in app directory
- **Collections**: `index.ts` in collection folders
- **Types**: `payload-types.ts` (auto-generated)

### Import Patterns
- Use `@/` path alias for src imports
- PayloadCMS config: `@payload-config`
- Relative imports for same-directory files

### Component Organization
- Group related components in folders
- Export main component as default
- Use TypeScript interfaces for props
- Client components explicitly marked with `'use client'`

### Database Collections
- Each collection in separate folder under `src/collections/`
- Main config in `index.ts`
- Related utilities in same folder
- Hooks and jobs in subfolders

### Styling Approach
- Tailwind CSS utility classes
- Custom CSS variables for theming
- Responsive design with mobile-first approach
- Dark mode support via CSS variables