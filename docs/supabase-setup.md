# Supabase Local Development Setup

This guide provides instructions for setting up Supabase locally for development, including how to use its built-in services like Inbucket for email testing.

## Overview

[Supabase](https://supabase.com/) is an open-source Firebase alternative that provides a PostgreSQL database, authentication, instant APIs, and various other services. In the OrcheStars project, we use Supabase for:

- PostgreSQL database
- Email testing with Inbucket
- Local development environment

## Prerequisites

Before setting up Supabase locally, ensure you have the following installed:

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Node.js](https://nodejs.org/) (version 22.x)
- [pnpm](https://pnpm.io/) (version 9.15.5+)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Installation

### 1. Install Supabase CLI

The Supabase CLI should be installed as a project dependency, not globally. There are several ways to install it:

#### Using Homebrew (macOS/Linux) - Recommended

```bash
# Install
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

#### Using npm/pnpm/yarn (as a dev dependency)

```bash
# Using npm
npm install supabase --save-dev

# Using pnpm
pnpm add -D supabase

# Using yarn
yarn add -D supabase

# Verify installation
npx supabase --version
```

> **Note:** Installing Supabase CLI as a global module is not supported. You'll get an error if you try to install it with `npm install -g supabase`.

#### Using Scoop (Windows)

```bash
# Add the Supabase bucket
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# Install
scoop install supabase

# Verify installation
supabase --version
```

### 2. Initialize Supabase in Your Project

The OrcheStars project already has Supabase configured. You can see the configuration in the `supabase/` directory. If you're setting up a new project, you would initialize Supabase with:

```bash
# If installed with Homebrew
supabase init

# If installed as a dev dependency with npm/pnpm/yarn
npx supabase init
```

### 3. Start Supabase Locally

To start all Supabase services locally:

```bash
# If installed with Homebrew
supabase start

# If installed as a dev dependency with npm/pnpm/yarn
npx supabase start
```

This command will:
- Pull the necessary Docker images
- Start the PostgreSQL database
- Start the Supabase services (Auth, Storage, etc.)
- Start Inbucket for email testing

You should see output similar to:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### 4. Configure Your Application to Use Supabase

Update your `.env` file to use the Supabase PostgreSQL database:

```
# Database connection string for Supabase local PostgreSQL
DATABASE_URI=postgres://postgres:postgres@127.0.0.1:54322/postgres
```

## Supabase Services

Supabase provides several services that run locally:

| Service | URL | Description |
|---------|-----|-------------|
| API | http://127.0.0.1:54321 | RESTful API endpoints |
| Studio | http://127.0.0.1:54323 | Web-based admin interface |
| Inbucket | http://127.0.0.1:54324 | Email testing service |
| PostgreSQL | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Database |

## Using Inbucket for Email Testing

Supabase includes [Inbucket](https://github.com/inbucket/inbucket), a disposable webmail testing service. This allows you to test email functionality without sending real emails.

### Configuration

The Inbucket configuration is defined in `supabase/config.toml`:

```toml
[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326
admin_email = "admin@email.com"
sender_name = "Admin"
```

### Integrating with Nodemailer

To use Inbucket with Nodemailer in the OrcheStars application, update your `.env` file:

```
EMAIL_PROVIDER=NODEMAILER
SMTP_HOST=localhost
SMTP_PORT=54325
```

This configuration will route all emails through Inbucket, where you can view them in the web interface at http://127.0.0.1:54324.

## Database Management

### Accessing the Database

You can access the PostgreSQL database using any PostgreSQL client with these credentials:

- Host: 127.0.0.1
- Port: 54322
- Database: postgres
- Username: postgres
- Password: postgres

### Using Supabase Studio

Supabase Studio provides a web-based interface for managing your database:

1. Open http://127.0.0.1:54323 in your browser
2. Navigate to the "Table Editor" to manage tables
3. Use the "SQL Editor" to run custom queries

### Migrations

For OrcheStars, we use PayloadCMS's migration system rather than Supabase migrations. To run migrations:

```bash
pnpm migrate
```

## Stopping Supabase

When you're done with development, you can stop the Supabase services:

```bash
# If installed with Homebrew
supabase stop

# If installed as a dev dependency with npm/pnpm/yarn
npx supabase stop
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - If you see errors about ports being in use, check if you have other services running on the same ports
   - You can modify the ports in `supabase/config.toml`

2. **Docker issues**
   - Ensure Docker is running
   - Try restarting Docker if you encounter connection issues

3. **Database connection issues**
   - Verify the connection string in your `.env` file
   - Check if the PostgreSQL service is running with `docker ps`

4. **Email not showing in Inbucket**
   - Verify the SMTP configuration in your `.env` file
   - Check if Inbucket is running by accessing http://127.0.0.1:54324

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Inbucket Documentation](https://github.com/inbucket/inbucket)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
