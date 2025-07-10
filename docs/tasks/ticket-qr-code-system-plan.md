# Ticket QR Code System Implementation Plan

## Overview
Transform the current manual QR code generation system into a modern ticket viewing experience where customers receive email links to view their tickets with QR codes, similar to popular platforms like Eventbrite and Ticketmaster.

## Current System Issues
1. Manual QR code generation requires all ticket details to be input manually
2. No persistent ticket viewing URLs
3. QR codes are not stored or linked to actual ticket records
4. Customers don't receive convenient links to view their tickets
5. No integration with the existing ticket/order system

## Proposed Solution Architecture

### Phase 1: Individual Ticket Viewing (Priority)
Create a ticket viewing system where each ticket can be accessed via a unique, secure URL.

#### 1.1 New Ticket Viewing Route
- **URL Pattern**: `/tickets/view/{ticketToken}`
- **Security**: Use signed/encrypted tokens to prevent ticket code guessing
- **Responsive**: Works on mobile and desktop

#### 1.2 Database Changes
Add new fields to the `Tickets` collection:
```typescript
{
  viewToken: string,        // Unique, secure token for viewing (UUID or encrypted)
  qrCodeData: string,       // Cached QR code data URL
  qrCodeGeneratedAt: date,  // When QR was last generated
}
```

#### 1.3 QR Code Content Structure
The QR code should contain structured data for check-in validation:
```json
{
  "ticketId": "internal_id",
  "ticketCode": "TK123456",
  "eventId": "event_id", 
  "eventScheduleId": "schedule_id",
  "seat": "A1",
  "userEmail": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "issueDate": "2024-01-01T10:00:00Z"
}
```

#### 1.4 Ticket Viewing Page Components
- **Header**: Event title, date, location
- **QR Code**: Large, scannable QR code with ticket info
- **Ticket Details**: 
  - Ticket code
  - Seat number
  - Attendee name
  - Event date/time
  - Venue location
- **Actions**:
  - Add to Apple Wallet button
  - Add to Google Wallet button
  - Download ticket as PDF
  - Share ticket (for gifts)

### Phase 2: Order-Based Multi-Ticket Viewing
Handle orders with multiple tickets.

#### 2.1 Order Viewing Route
- **URL Pattern**: `/orders/view/{orderToken}`
- **Shows**: All tickets for an order with individual QR codes

#### 2.2 Database Changes
Add to `Orders` collection:
```typescript
{
  viewToken: string,  // Unique token for viewing all order tickets
}
```

### Phase 3: Email Integration
Update email templates to include ticket viewing links.

#### 3.1 Email Template Updates
Modify `generateTicketDisneyEventBookEmailHtml` to include:
- **Primary CTA**: "View Your Ticket" button linking to ticket view page
- **Secondary**: "View All Tickets" (for multi-ticket orders)
- **Instructions**: How to use the QR code for check-in

#### 3.2 Email Content Structure
```html
<div class="ticket-action">
  <a href="{baseUrl}/tickets/view/{ticketToken}" class="btn-primary">
    View Your Ticket
  </a>
  <p>Or copy this link: {baseUrl}/tickets/view/{ticketToken}</p>
</div>
```

## Implementation Details

### File Structure
```
src/
├── app/(frontend)/
│   ├── tickets/
│   │   └── view/
│   │       └── [token]/
│   │           └── page.tsx              # Individual ticket view
│   └── orders/
│       └── view/
│           └── [token]/
│               └── page.tsx              # Order tickets view
├── components/
│   ├── TicketView/
│   │   ├── TicketCard.tsx               # Individual ticket display
│   │   ├── QRCodeDisplay.tsx            # QR code component
│   │   ├── TicketActions.tsx            # Wallet buttons, download
│   │   └── EventHeader.tsx              # Event info header
│   └── OrderView/
│       └── MultiTicketView.tsx          # Multiple tickets display
├── collections/
│   ├── Tickets/
│   │   └── hooks/
│   │       └── generateViewToken.ts     # Generate secure tokens
│   └── Orders/
│       └── hooks/
│           └── generateViewToken.ts     # Generate order tokens
├── utilities/
│   ├── generateQRCode.ts                # QR code generation logic
│   ├── generateTicketPDF.ts             # PDF generation
│   └── walletIntegration.ts             # Apple/Google Wallet
└── mail/templates/
    └── TicketWithQRLinkEmail.ts         # Updated email template
```

### API Endpoints

#### Ticket Viewing API
```typescript
// GET /api/tickets/view/{token}
// Returns ticket data for viewing page
{
  ticket: {
    ticketCode: string,
    seat: string,
    attendeeName: string,
    event: EventDetails,
    qrCodeDataUrl: string,
    // ... other ticket details
  },
  isValid: boolean,
  error?: string
}
```

#### QR Code Generation API
```typescript
// POST /api/tickets/{ticketId}/qr-code
// Generates and caches QR code for ticket
{
  qrCodeDataUrl: string,
  generatedAt: string
}
```

### Security Considerations

#### Token Generation
- Use crypto-secure random tokens (UUID v4 or crypto.randomBytes)
- Consider expiring tokens after event date + buffer
- Store hashed versions in database for lookup

#### Access Control
- Validate tokens server-side
- Rate limit ticket viewing endpoints
- Log access attempts for security monitoring

### Database Migrations

#### Migration 1: Add Ticket View Tokens
```sql
ALTER TABLE tickets 
ADD COLUMN view_token VARCHAR(255) UNIQUE,
ADD COLUMN qr_code_data TEXT,
ADD COLUMN qr_code_generated_at TIMESTAMP;

CREATE INDEX idx_tickets_view_token ON tickets(view_token);
```

#### Migration 2: Add Order View Tokens
```sql
ALTER TABLE orders 
ADD COLUMN view_token VARCHAR(255) UNIQUE;

CREATE INDEX idx_orders_view_token ON orders(view_token);
```

### Integration Points

#### Existing Check-in System
- Update `/checkin/scan` to handle new QR code format
- Maintain backward compatibility with existing QR codes
- Validate against new structured QR data

#### Current Email System
- Integrate with existing `sendTicketMail` function
- Update email templates to include ticket links
- Ensure queue system handles new email format

#### Mobile Optimization
- Ensure ticket viewing pages are mobile-responsive
- Optimize QR codes for mobile scanning
- Consider PWA features for offline ticket access

## Implementation Priority

### Sprint 1: Core Ticket Viewing (1-2 weeks)
1. Create ticket viewing page structure
2. Implement secure token generation
3. Build QR code generation and caching
4. Create responsive ticket display components

### Sprint 2: Integration & Testing (1 week)
1. Update email templates with ticket links
2. Test QR code scanning with existing check-in system
3. Add proper error handling and validation
4. Mobile optimization and testing

### Sprint 3: Multi-ticket Support (1 week)
1. Implement order-based ticket viewing
2. Handle multiple tickets display
3. Update email system for multi-ticket orders

### Sprint 4: Enhancement & Polish (1 week)
1. Add Apple/Google Wallet integration
2. PDF download functionality
3. Performance optimization
4. Analytics and monitoring

## Success Metrics
- Reduced manual QR code generation usage
- Improved customer satisfaction with ticket access
- Faster check-in times at events
- Reduced support requests about ticket access

## Future Enhancements
- Ticket transfer functionality
- Social sharing features
- Offline ticket access (PWA)
- Push notifications for event reminders
- Integration with calendar apps

## Notes
- Maintain backward compatibility with existing QR codes during transition
- Consider implementing feature flags for gradual rollout
- Plan for peak traffic during event times
- Ensure proper error handling for expired or invalid tokens 