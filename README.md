<p align="center">
  <img src="https://www.orchestars.vn/api/media/file/logo-white-adjacent%20copy.png" width="200" height="200" alt="OrcheSTARS Platform" />
</p>

# OrcheSTARS - Event Ticketing and Management Platform

OrcheStars is a comprehensive event ticketing and management platform built on top of PayloadCMS and Next.js. The system enables organizations to create, manage, and sell tickets for events while providing a seamless check-in experience for attendees.

## Key Features

- **Advanced Ticket Management**
  - Zone-based ticket sales with dynamic pricing
  - Temporary seat holding system to prevent double-booking
  - Post-purchase seat allocation and assignment
  - QR code ticket generation and validation

- **Multi-channel Check-in System**
  - Staff check-in interface for event entry management
  - Customer self-service check-in via mobile
  - Real-time ticket validation and verification
  - Support for group check-ins and "sister tickets"

- **Flexible Payment Processing**
  - Integration with ZaloPay payment gateway
  - Bank transfer support with VietQR code generation
  - Promotion and discount management
  - Secure transaction handling

- **Internationalization**
  - Full support for multiple languages (English and Vietnamese)
  - Localized content, dates, and currency formats
  - Language-specific email templates

- **Event Management**
  - Complete event lifecycle from creation to completion
  - Schedule management with multiple performance dates
  - Performer and partner/sponsor management
  - Rich content management for event details

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend Framework | Next.js 15.2 | Server-side rendering, API routes, server components |
| CMS | Payload CMS 3.30 | Content management, data modeling, admin interface |
| Database | PostgreSQL | Data persistence via `@payloadcms/db-postgres` |
| File Storage | Vercel Blob Storage | Media file storage and delivery |
| UI Components | Radix UI, Shadcn/UI | Accessible UI components |
| Error Monitoring | Sentry | Application monitoring and error tracking |
| Payments | Custom integrations | ZaloPay and bank transfer support |
| Email | Resend | Transactional emails and ticket delivery |

### PayloadCMS Plugins

The project leverages several PayloadCMS plugins to extend functionality:

| Plugin | Purpose |
|--------|---------|
| `@payloadcms/plugin-form-builder` | Create and manage custom forms |
| `@payloadcms/plugin-nested-docs` | Hierarchical content like categories |
| `@payloadcms/plugin-redirects` | URL management and redirects |
| `@payloadcms/plugin-seo` | SEO metadata management |
| `@payloadcms/plugin-search` | Site-wide search functionality |
| `@payloadcms/plugin-import-export` | Data import/export capabilities |
| `@payloadcms/storage-vercel-blob` | Integration with Vercel Blob Storage |
| `@payloadcms/email-resend` | Email delivery via Resend |
| `@payloadcms/richtext-lexical` | Rich text editing with Lexical |

### Project Structure

```
orchestars/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (frontend)/      # Public-facing routes
│   │   ├── (payload)/       # Admin routes
│   │   └── api/             # API endpoints
│   ├── blocks/              # Content blocks for layout builder
│   ├── collections/         # PayloadCMS collections
│   │   ├── Events/          # Event management
│   │   ├── Orders/          # Order processing
│   │   ├── Payments/        # Payment handling
│   │   ├── Tickets/         # Ticket generation
│   │   ├── Users/           # User management
│   │   └── ...              # Other collections
│   ├── components/          # React components
│   ├── config/              # Configuration files
│   ├── fields/              # Custom field types
│   ├── hooks/               # Custom hooks
│   ├── plugins/             # Plugin configuration
│   ├── utilities/           # Helper functions
│   └── payload.config.ts    # PayloadCMS configuration
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## System Architecture

OrcheStars extends PayloadCMS with custom functionality specifically designed for event ticketing:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Applications                   │
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ Public Website│  │Check-in App   │  │Admin Panel    │   │
│  │ (Next.js)     │  │(Next.js)      │  │(Payload CMS)  │   │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
└──────────┼───────────────────┼───────────────────┼─────────┘
           │                   │                   │
┌──────────┼───────────────────┼───────────────────┼─────────┐
│          │                   │                   │         │
│  ┌───────▼───────┐  ┌────────▼──────┐  ┌─────────▼─────┐   │
│  │ Ticket System │  │Check-in System│  │Event Management│   │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
│          │                  │                  │           │
│  ┌───────▼──────────────────▼──────────────────▼───────┐   │
│  │                   PayloadCMS Core                   │   │
│  └───────────────────────────┬───────────────────────┬─┘   │
│                              │                       │     │
│  ┌────────────────────────┐  │  ┌───────────────────┐│     │
│  │Payment Processing      │◄─┘  │File Storage       ││     │
│  │(ZaloPay, Bank Transfer)│     │(Vercel Blob)      ││     │
│  └────────────────────────┘     └───────────────────┘│     │
│                                                      │     │
└──────────────────────────────────────────────────────┼─────┘
                                                       │
┌──────────────────────────────────────────────────────▼─────┐
│                      PostgreSQL Database                   │
└─────────────────────────────────────────────────────────────┘
```

## Key Workflows

### Ticket Purchase Flow

1. Customer browses events and selects tickets
2. System creates temporary seat holding (20-minute duration)
3. Customer enters information and selects payment method
4. Payment is processed through ZaloPay or bank transfer
5. System generates tickets with QR codes
6. Confirmation email is sent to customer

### Check-in Process

1. Event staff selects event and schedule
2. Staff scans ticket QR code or enters ticket code/seat number
3. System validates ticket against database
4. Staff confirms check-in and provides physical ticket/wristband
5. System records check-in time and staff member

## Getting Started

### Prerequisites

- Node.js 22.x
- PostgreSQL 14+
- pnpm 9.15.5+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd orchestars
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file:
```
# Database connection string
DATABASE_URI=postgres://username:password@localhost:5432/orchestars

# Used to encrypt JWT tokens
PAYLOAD_SECRET=your_secret_here

# Used to configure CORS, format links and more
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Resend API key for email delivery
RESEND_API_KEY=re_your_key_here

# Vercel Blob Storage for media files
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here

# Payment gateway credentials
ZALO_APP_ID=your_app_id
ZALO_KEY1=your_key1
ZALO_KEY2=your_key2
```

5. Set up the database
```bash
# Option 1: Using Docker
docker-compose up -d

# Option 2: Create PostgreSQL database manually
createdb orchestars

# Run migrations
pnpm migrate
```

6. Generate TypeScript types
```bash
pnpm generate:types
```

7. Start the development server
```bash
pnpm dev
```

8. Access the application
- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm migrate` | Run database migrations |
| `pnpm migrate:create` | Create a new migration |
| `pnpm generate:types` | Generate TypeScript types |
| `pnpm generate:importmap` | Generate import map |
| `pnpm reinstall` | Clean install dependencies |
| `pnpm lint` | Run linter |
| `pnpm lint:fix` | Fix linting issues |

## Deployment

The application is designed to be deployed on Vercel with a PostgreSQL database:

### Vercel Deployment

1. Configure environment variables in Vercel:
   - `DATABASE_URI`: PostgreSQL connection string
   - `PAYLOAD_SECRET`: Secret for JWT tokens
   - `NEXT_PUBLIC_SERVER_URL`: Production URL
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage token
   - `RESEND_API_KEY`: Resend API key
   - Payment gateway credentials

2. Connect your repository to Vercel

3. Configure build settings:
   - Build Command: `pnpm ci`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. Deploy the application

### Database Migrations

When deploying with schema changes:

1. Create migrations locally:
```bash
pnpm migrate:create
```

2. Commit migration files to your repository

3. Run migrations on deployment:
```bash
pnpm migrate
```

### Docker Deployment

You can also deploy using Docker:

1. Build the Docker image:
```bash
docker build -t orchestars .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env orchestars
```

## Data Model

OrcheSTARS uses PayloadCMS collections to model the data. Here are the key collections:

### Core Collections

| Collection | Purpose |
|------------|---------|
| `Events` | Event details, schedules, and configuration |
| `Tickets` | Generated tickets with QR codes |
| `Orders` | Customer orders with payment status |
| `OrderItems` | Individual items within orders |
| `Payments` | Payment transactions and status |
| `SeatHoldings` | Temporary seat reservations |
| `Users` | Customer accounts |
| `Admins` | Administrative users |

### Content Collections

| Collection | Purpose |
|------------|---------|
| `Pages` | Static pages with layout builder |
| `Posts` | Blog posts and news articles |
| `Media` | Images and other media files |
| `Categories` | Content categorization |
| `Partners` | Event partners and sponsors |
| `Performers` | Artists and performers |
| `FAQs` | Frequently asked questions |

### Support Collections

| Collection | Purpose |
|------------|---------|
| `Promotions` | Discount configurations |
| `UserPromotionRedemptions` | Promotion usage tracking |
| `CheckInRecords` | Event attendance tracking |
| `Activities` | System activity logs |
| `Emails` | Email tracking and history |
| `Logs` | System logs |

## Advanced Features

### Scheduled Jobs

The system uses PayloadCMS's job queue for scheduled tasks:

```typescript
jobs: {
  autoRun: [
    {
      cron: '*/5 * * * *', // Runs every 5 minutes
      limit: 1,
      queue: 'updatePaymentStatus',
    },
  ],
}
```

### Internationalization

The application supports multiple languages through PayloadCMS's localization:

```typescript
i18n: {
  defaultLocale: 'vi',
  locales: ['vi', 'en'],
},
localization: {
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  fallback: true,
}
```

### Live Preview

Content editors can preview changes in real-time using PayloadCMS's live preview feature:

```typescript
livePreview: {
  breakpoints: [
    {
      label: 'Mobile',
      name: 'mobile',
      width: 375,
      height: 667,
    },
    {
      label: 'Tablet',
      name: 'tablet',
      width: 768,
      height: 1024,
    },
    {
      label: 'Desktop',
      name: 'desktop',
      width: 1440,
      height: 900,
    },
  ],
}
```

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.