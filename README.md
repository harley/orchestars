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
- pnpm

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
# Edit .env with your configuration
```

4. Set up the database
```bash
# Using Docker
docker-compose up -d

# Run migrations
pnpm migrate
```

5. Start the development server
```bash
pnpm dev
```

6. Access the application
- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

## Deployment

The application is designed to be deployed on Vercel with a PostgreSQL database:

1. Configure environment variables in Vercel
2. Connect your repository to Vercel
3. Deploy the application

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.