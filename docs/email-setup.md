# Email Setup Guide

This guide provides information on how to set up and configure email functionality in the OrcheStars application.

## Overview

OrcheStars supports two email providers:

1. **Resend** - Default provider for production environments
2. **Nodemailer** - Used for local development with Inbucket

## Configuration

Email configuration is managed through environment variables in your `.env` file.

### Common Configuration

```
# Email Provider: 'RESEND' or 'NODEMAILER'
EMAIL_PROVIDER=RESEND

# Default sender information
EMAIL_DEFAULT_FROM_ADDRESS=info@orchestars.vn
EMAIL_DEFAULT_FROM_NAME=Orchestars
```

### Resend Configuration

For production environments, we use [Resend](https://resend.com/) as our email service provider:

```
# Resend API Key
RESEND_API_KEY=re_your_api_key_here
```

### Nodemailer Configuration

Nodemailer can be used with any SMTP server, both for production environments and local development.

#### Production SMTP Configuration

For production environments, you can configure Nodemailer to use your organization's SMTP server or a third-party email service that supports SMTP (like Gmail, SendGrid, Mailgun, etc.):

```
# Email Provider
EMAIL_PROVIDER=NODEMAILER

# Default sender information
EMAIL_DEFAULT_FROM_ADDRESS=info@orchestars.vn
EMAIL_DEFAULT_FROM_NAME=Orchestars

# SMTP Configuration for Nodemailer
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
```

Common SMTP configurations for popular services:

| Service | SMTP Host | SMTP Port | Notes |
|---------|-----------|-----------|-------|
| Gmail | smtp.gmail.com | 587 | Requires app password if 2FA is enabled |
| SendGrid | smtp.sendgrid.net | 587 | Requires API key as password |
| Mailgun | smtp.mailgun.org | 587 | Requires SMTP credentials |
| Office 365 | smtp.office365.com | 587 | Requires account credentials |

#### Local Development Configuration

For local development, you can use Nodemailer with [Inbucket](https://github.com/inbucket/inbucket), a disposable webmail testing service:

```
# Email Provider
EMAIL_PROVIDER=NODEMAILER

# Default sender information
EMAIL_DEFAULT_FROM_ADDRESS=info@orchestars.vn
EMAIL_DEFAULT_FROM_NAME=Orchestars

# SMTP Configuration for Nodemailer (local)
SMTP_HOST=localhost
SMTP_PORT=2500
SMTP_USER=
SMTP_PASS=
```

## Setting Up Inbucket for Local Development

[Inbucket](https://github.com/inbucket/inbucket) is an email testing service that accepts messages for any email address and makes them available via web, REST, and POP3 interfaces.

### Using Docker

The easiest way to set up Inbucket is using Docker:

```bash
docker run -d --name inbucket -p 9000:9000 -p 2500:2500 -p 1100:1100 inbucket/inbucket
```

This will start Inbucket with the following services:
- Web interface: http://localhost:9000
- SMTP server: localhost:2500
- POP3 server: localhost:1100

### Using Supabase Local Development

If you're using Supabase for local development, Inbucket is already included in the Supabase Docker setup. This is the recommended approach for the OrcheStars project.

#### Starting Supabase with Inbucket

1. Start Supabase using the CLI:

```bash
supabase start
```

2. Once started, you can access Inbucket at:
   - Web interface: http://127.0.0.1:54324

The SMTP configuration is already set up in the Supabase `config.toml` file:

```toml
[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326
admin_email = "admin@email.com"
sender_name = "Admin"
```

#### Configuring Nodemailer with Supabase's Inbucket

To use Supabase's Inbucket with Nodemailer, update your `.env` file:

```
EMAIL_PROVIDER=NODEMAILER
SMTP_HOST=localhost
SMTP_PORT=54325
```

For more detailed information about setting up Supabase locally, see the [Supabase Setup Guide](supabase-setup.md).

## Email Flow

1. Application code calls `payload.sendEmail()` with email data
2. PayloadCMS routes the email through the configured adapter (Resend or Nodemailer)
3. The adapter sends the email via the appropriate service
4. Email delivery status is logged in the `emails` collection

## Testing Emails

### Local Development with Inbucket

1. Configure your application to use Nodemailer with Inbucket
2. Send an email through your application
3. View the email in the Inbucket web interface (http://localhost:9000 or http://localhost:54324)

### Production Testing

For testing in production-like environments:

#### Testing with Resend

1. Use a test Resend API key
2. Configure your application to use Resend
3. Send test emails to verified addresses
4. Check the Resend dashboard for delivery status

#### Testing with SMTP

1. Use a test SMTP server or a test account with your email provider
2. Configure your application to use Nodemailer with your SMTP settings
3. Send test emails to verified addresses
4. Check your email provider's logs or dashboard for delivery status
5. For debugging SMTP issues, you can use tools like [MailTrap](https://mailtrap.io/) or [Ethereal Email](https://ethereal.email/)

## Troubleshooting

### Common Issues

1. **Emails not appearing in Inbucket**
   - Verify Inbucket is running (`docker ps`)
   - Check SMTP port configuration matches Inbucket's SMTP port
   - Ensure EMAIL_PROVIDER is set to NODEMAILER

2. **Resend API errors**
   - Verify your Resend API key is correct
   - Ensure the sender domain is verified in Resend
   - Check if you've reached your Resend sending limits

3. **Configuration not being applied**
   - Restart your application after changing environment variables
   - Verify the variables are correctly set in your environment

## Email Templates

Email templates are stored in the `src/mail/templates` directory. Each template is a function that generates HTML content for a specific type of email.

To create a new email template:

1. Create a new file in `src/mail/templates`
2. Export a function that generates HTML content
3. Use the template in your application code by calling the function and passing the result to `payload.sendEmail()`

Example:

```typescript
// src/mail/templates/WelcomeEmail.ts
export const generateWelcomeEmailHtml = (data: { name: string }) => {
  return `
    <h1>Welcome to Orchestars, ${data.name}!</h1>
    <p>Thank you for joining our platform.</p>
  `;
};

// Usage in application code
import { generateWelcomeEmailHtml } from '@/mail/templates/WelcomeEmail';

await payload.sendEmail({
  to: user.email,
  subject: 'Welcome to Orchestars',
  html: generateWelcomeEmailHtml({ name: user.name }),
});
```
