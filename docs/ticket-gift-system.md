# Ticket Gift System

## Overview

The Ticket Gift System allows ticket owners to transfer their purchased tickets to other users. This feature enables seamless ticket sharing while maintaining proper ownership tracking and user account management.

## Key Features

- **Ticket Transfer**: Transfer tickets from original purchaser to recipient
- **User Account Management**: Automatically creates accounts for new recipients
- **Email Notifications**: Sends gift confirmation and account setup emails
- **Admin Interface**: Easy-to-use admin panel for managing ticket gifts
- **Validation**: Comprehensive validation to ensure only valid tickets can be gifted

## System Architecture

### Database Schema

The system extends the existing `tickets` collection with gift-related fields:

```typescript
giftInfo: {
  isGifted: boolean          // Marks if ticket is gifted
  attendeeName: string       // Name of gift recipient
  giftRecipient: number      // User ID of recipient
  giftDate: Date            // When gift was created
}
```

### API Endpoints

- **POST** `/api/tickets/gift-ticket` - Main gift creation endpoint
- **GET** `/api/users` - User search for gift form
- **GET** `/api/tickets` - Ticket retrieval with gift filters

### Admin Interface

- **URL**: `/admin/create-ticket-gift`
- **Access**: Admin users only
- **Components**: 
  - `CreateTicketGift.tsx` - Main page wrapper
  - `CreateTicketGiftForm.tsx` - Interactive form component

## User Flow

### 1. Admin Access
1. Admin logs into PayloadCMS admin panel
2. Navigates to "Create Ticket Gifts" page (`/admin/create-ticket-gift`)
3. Sees the gift creation form

### 2. Ticket Owner Selection
1. Admin searches for ticket owner by email
2. System provides autocomplete suggestions
3. Admin selects the ticket owner
4. System loads all giftable tickets for that owner

**Giftable Ticket Criteria:**
- Status: `booked` (paid and confirmed)
- Not previously gifted (`giftInfo.isGifted = false`)
- Belongs to selected owner

### 3. Ticket Selection
1. System displays all eligible tickets with details:
   - Ticket code
   - Seat number (if applicable)
   - Event name and date
   - Ticket price tier
2. Admin can search/filter tickets by code or seat
3. Admin selects one or multiple tickets to gift

### 4. Recipient Information
Admin enters recipient details:
- **First Name** (required)
- **Last Name** (required)
- **Email** (required, validated)
- **Phone** (optional)

### 5. Gift Processing
1. System validates all inputs
2. Creates or finds recipient user account
3. Transfers ticket ownership
4. Sends notification email
5. Shows success confirmation

## Technical Implementation

### Form Validation

Uses Zod schema for comprehensive validation:

```typescript
const schema = z.object({
  ownerId: z.string().min(1, 'Ticket owner is required'),
  ticketIds: z.array(z.number()).min(1, 'Select at least one ticket'),
  recipientFirstName: z.string().min(1, 'First name is required'),
  recipientLastName: z.string().min(1, 'Last name is required'),
  recipientEmail: z.string().min(1, 'Email is required').email('Invalid email'),
  recipientPhone: z.string().optional(),
})
```

### User Account Management

**Existing User:**
- System finds user by email
- Links tickets to existing account
- Sends gift notification email

**New User:**
- Creates new user account with provided details
- Generates password reset token
- Sends welcome email with account setup link
- Token expires in 1 hour

### Email System

**Gift Notification Email:**
- Ticket details (code, seat, event info)
- Gifted by information
- Account setup instructions (for new users)
- Event attendance guidelines

**Template**: `GiftTicketAndAccountSetup.ts`
- Bilingual (Vietnamese/English)
- Responsive HTML design
- Includes all necessary event information

### Database Transactions

The system uses database transactions to ensure data consistency:
1. Begin transaction
2. Validate tickets
3. Create/find user
4. Update ticket ownership
5. Send email
6. Commit transaction
7. Rollback on any error

## Security & Validation

### Ticket Validation
- Verifies ticket ownership
- Checks ticket status (must be 'booked')
- Ensures tickets haven't been gifted before
- Validates ticket existence

### User Validation
- Email format validation
- Duplicate email handling
- Required field validation
- Phone number optional validation

### Admin Access Control
- Requires admin authentication
- Uses PayloadCMS permission system
- Redirects unauthorized users to login

## Error Handling

### Common Error Scenarios
1. **Invalid ticket owner**: User not found or no tickets
2. **Already gifted tickets**: Tickets previously transferred
3. **Invalid recipient email**: Malformed or duplicate email
4. **Database errors**: Transaction rollback and error logging
5. **Email delivery failures**: Logged but doesn't block transaction

### User Feedback
- Success messages with transfer details
- Clear error messages for validation failures
- Loading states during processing
- Toast notifications for immediate feedback

## Monitoring & Logging

### Database Logging
- Gift transactions logged in tickets table
- User creation/updates tracked
- Email delivery status recorded

### Error Logging
- API endpoint errors logged to console
- Email delivery failures tracked
- Database transaction failures recorded

## Future Enhancements

### Planned Features
- **Transfer History Log**: Track all gift transfers
- **Bulk Gift Operations**: Gift multiple tickets to different recipients
- **Gift Expiration**: Set expiration dates for gifts
- **Gift Cancellation**: Allow reversal of recent gifts
- **Notification Preferences**: User control over email notifications

### Technical Improvements
- **Real-time Updates**: WebSocket notifications for gift status
- **Advanced Search**: Better filtering and search capabilities
- **Audit Trail**: Complete history of ticket ownership changes
- **API Rate Limiting**: Prevent abuse of gift system

## Troubleshooting

### Common Issues

**Tickets not showing for owner:**
- Check ticket status (must be 'booked')
- Verify giftInfo.isGifted is false
- Ensure user owns the tickets

**Email not delivered:**
- Check email configuration
- Verify recipient email address
- Check spam/junk folders
- Review email logs

**Gift creation fails:**
- Verify all required fields
- Check database connectivity
- Review transaction logs
- Ensure admin permissions

### Support Procedures
1. Check admin logs for error details
2. Verify user and ticket data in database
3. Test email delivery manually
4. Review PayloadCMS admin permissions
5. Check database transaction status

## API Reference

### POST /api/tickets/gift-ticket

**Request Body:**
```json
{
  "ownerId": 123,
  "ticketIds": [456, 789],
  "recipientFirstName": "John",
  "recipientLastName": "Doe", 
  "recipientEmail": "john@example.com",
  "recipientPhone": "+1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tickets gifted successfully",
  "data": {
    "recipientUserId": 789,
    "isNewUser": true,
    "transferredTickets": 2
  }
}
```

**Error Response (500):**
```json
{
  "message": "Failed to create gift ticket",
  "error": "Detailed error message"
}
```

This comprehensive system ensures secure, reliable ticket gifting while maintaining excellent user experience for both administrators and recipients.
