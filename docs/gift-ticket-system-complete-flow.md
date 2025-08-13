# Gift Ticket System - Complete Flow Documentation

## Overview

The Gift Ticket System is a comprehensive feature that allows ticket owners to transfer their purchased tickets to recipients. The system handles the entire lifecycle from gift creation to recipient confirmation, including automatic user account management and secure verification processes.

## System Architecture

### Core Components

1. **Admin Gift Creation Interface** (`/admin/create-ticket-gift`)
2. **Gift Ticket API** (`/api/tickets/gift-ticket`)
3. **Recipient Verification Page** (`/user/gift-ticket-verification/[confirmationGiftToken]`)
4. **Password Setup Flow** (for new users)
5. **Email Notification System**

### Database Schema Extensions

The system extends the existing `tickets` collection with gift-related fields:

```typescript
giftInfo: {
  isGifted: boolean                              // Marks if ticket is gifted
  attendeeName: string                           // Name of gift recipient
  giftRecipient: number                          // User ID of recipient
  giftDate: Date                                // When gift was created
  status: RecipientTicketStatus                  // Current status (pending/confirmed/expired)
  recipientConfirmationExpiresAt: Date          // Expiration for confirmation (24 hours)
}
```

### Recipient Ticket Status Constants

```typescript
export const RECIPIENT_TICKET_STATUS = {
  pending: { label: 'Pending', value: 'pending' },      // Gift created, awaiting confirmation
  confirmed: { label: 'Confirmed', value: 'confirmed' }, // Recipient confirmed receipt
  expired: { label: 'Expired', value: 'expired' }       // Confirmation link expired
}
```

## Complete User Flow

### Phase 1: Gift Creation (Admin)

#### 1.1 Admin Access
- Admin logs into PayloadCMS admin panel
- Navigates to "Create Ticket Gifts" page (`/admin/create-ticket-gift`)
- Access restricted to admin and super-admin users only

#### 1.2 Ticket Owner Selection
- Admin searches for ticket owner by email
- System provides autocomplete suggestions
- Admin selects the ticket owner
- System loads all giftable tickets for that owner

**Giftable Ticket Criteria:**
- Status: `booked` (paid and confirmed)
- Not previously gifted (`giftInfo.isGifted = false`)
- Belongs to selected owner
- Not for past events
- Not already checked in

#### 1.3 Ticket Selection
- System displays eligible tickets with details:
  - Ticket code
  - Seat number (if applicable)
  - Event name, date, and location
  - Ticket price tier
- Admin can search/filter tickets by code or seat
- Admin selects one or multiple tickets to gift

#### 1.4 Recipient Information
Admin enters recipient details:
- **First Name** (required)
- **Last Name** (required)
- **Email** (required, validated)
- **Phone** (optional)
- **Personal Message** (optional)

#### 1.5 Gift Processing
1. System validates all inputs using Zod schema
2. Creates or finds recipient user account
3. Transfers ticket ownership
4. Generates encrypted confirmation token
5. Sends notification email
6. Shows success confirmation

### Phase 2: User Account Management

#### 2.1 Existing User Handling
- System finds user by email (case-insensitive)
- Links tickets to existing account
- Sends gift notification email with confirmation link

#### 2.2 New User Creation
- Creates new user account with provided details
- Sets role to `user`
- Generates password reset token (expires in 24 hours)
- Sends welcome email with account setup link
- Includes both gift confirmation and password setup

### Phase 3: Email Notification

#### 3.1 Email Content
Recipients receive a comprehensive email containing:
- **Ticket Details**: Code, seat, event name, date, location, time
- **Gift Information**: Who gifted the tickets
- **Account Setup**: Password setup link (new users only)
- **Event Guidelines**: Check-in instructions and policies
- **Bilingual Content**: Vietnamese and English

#### 3.2 Email Templates
- **Template**: `GiftTicketAndAccountSetup.ts`
- **Features**: Responsive HTML design, bilingual support
- **Includes**: All necessary event information and setup instructions

### Phase 4: Recipient Verification

#### 4.1 Confirmation Link Structure
```
/user/gift-ticket-verification/[confirmationGiftToken]?rpwToken=[token]&redirectTo=[url]
```

**Parameters:**
- `confirmationGiftToken`: Encrypted data containing userId and ticketCodes
- `rpwToken`: Password reset token (for new users only)
- `redirectTo`: Final destination after setup (default: `/user/my-tickets?t=gifted`)

#### 4.2 Token Encryption/Decryption
```typescript
// Encryption (when creating gift)
const encryptedData = {
  userId: recipient.userId,
  ticketCodes: ticketCodes
}
const confirmationGiftToken = encrypt(JSON.stringify(encryptedData))

// Decryption (when verifying)
const decoded = decrypt(confirmationGiftToken)
const userData = JSON.parse(decoded)
```

#### 4.3 Verification Process
1. **Token Validation**: Decrypt and validate confirmation token
2. **User Verification**: Confirm user exists and is valid
3. **Ticket Verification**: Verify tickets belong to user and are gifted
4. **Expiration Check**: Ensure confirmation link hasn't expired (24 hours)
5. **Status Update**: Mark tickets as confirmed
6. **Flow Routing**: Direct to appropriate next step

### Phase 5: Password Setup (New Users)

#### 5.1 Countdown Component
- **Duration**: 15 seconds countdown
- **Purpose**: Give users time to read instructions
- **Auto-redirect**: Automatically redirects to password setup after countdown
- **Manual Option**: Users can click "Setup Password Now" to skip countdown

#### 5.2 Password Setup Flow
- Redirects to `/user/reset-password?token=[rpwToken]`
- User creates secure password
- Account becomes fully activated
- Final redirect to gift tickets page

### Phase 6: Final Access

#### 6.1 Existing Users
- Confirmation completes immediately
- Redirected to gift tickets page
- Can access tickets through existing login

#### 6.2 New Users
- Must complete password setup first
- Account becomes fully functional
- Access to all gifted tickets

## Technical Implementation Details

### API Endpoints

#### POST `/api/tickets/gift-ticket`
**Purpose**: Create gift ticket transfer
**Access**: Admin users only
**Request Body**:
```typescript
interface CreateGiftTicketRequest {
  ownerId: number
  ticketIds: number[]
  recipientFirstName: string
  recipientLastName: string
  recipientEmail: string
  recipientPhone?: string
  message?: string
}
```

**Response**:
```typescript
{
  success: boolean
  message: string
  data: {
    recipientUserId: number
    isNewUser: boolean
    transferredTickets: number
  }
}
```

### Database Transactions

The system uses database transactions to ensure data consistency:

```typescript
// Start transaction
const transactionID = await payload.db.beginTransaction()

try {
  // 1. Validate tickets for gifting
  const validation = await validateTicketsForGifting(ticketIds, ownerId, payload)
  
  // 2. Create or find recipient user
  const recipient = await createOrFindRecipientUser(...)
  
  // 3. Transfer tickets to recipient
  const transferResult = await transferTicketsToRecipient(...)
  
  // 4. Send email notification
  await sendGiftTicketAndAccountSetupMail(...)
  
  // Commit transaction
  await payload.db.commitTransaction(transactionID)
} catch (error) {
  // Rollback on error
  await payload.db.rollbackTransaction(transactionID)
  throw error
}
```

### Validation Functions

#### Ticket Validation
```typescript
async function validateTicketsForGifting(
  ticketIds: number[],
  ownerId: number,
  payload: any
): Promise<{ valid: boolean; errors: string[]; tickets: Ticket[] }>
```

**Checks:**
- Tickets exist and belong to owner
- Status is 'booked'
- Not for past events
- Not already checked in
- Not previously gifted

#### User Validation
```typescript
async function createOrFindRecipientUser(
  email: string,
  firstName: string,
  lastName: string,
  phone: string | undefined,
  payload: any,
  transactionID?: string | number
): Promise<CreateOrFindUserResult>
```

**Features:**
- Case-insensitive email search
- Automatic user creation for new recipients
- Phone number handling
- Role assignment

### Security Features

#### Access Control
- Admin-only gift creation
- Encrypted confirmation tokens
- 24-hour expiration for confirmation links
- 24-hour expiration for password setup tokens

#### Data Validation
- Comprehensive input validation using Zod
- SQL injection prevention
- XSS protection through proper encoding

#### Audit Trail
- Gift creation timestamps
- User creation tracking
- Ticket status changes
- Email delivery logging

## Error Handling & Edge Cases

### Common Error Scenarios

#### 1. Invalid Confirmation Link
- **Cause**: Expired token, malformed URL, invalid user
- **Response**: Error page with "Invalid confirmation link" message
- **Action**: Admin must resend gift or create new one

#### 2. Already Confirmed Tickets
- **Cause**: Recipient already confirmed receipt
- **Response**: "Already confirmed" message with redirect option
- **Action**: Redirect to gift tickets page

#### 3. Expired Confirmation Link
- **Cause**: 24-hour expiration exceeded
- **Response**: Error page with expiration message
- **Action**: Admin must resend gift

#### 4. Email Delivery Failures
- **Cause**: Invalid email, server issues, spam filters
- **Response**: Gift created but email not delivered
- **Action**: Admin can resend email or provide manual link

### Error Recovery

#### For Admins
1. **Resend Gift**: Create new gift with same recipient
2. **Manual Link**: Provide confirmation link directly
3. **Status Check**: Verify ticket and user status
4. **Support Contact**: Assist with technical issues

#### For Recipients
1. **Check Spam**: Look in junk/spam folders
2. **Contact Admin**: Request resend or manual assistance
3. **Verify Email**: Ensure correct email address
4. **Browser Issues**: Try different browser or clear cache

## Monitoring & Analytics

### Key Metrics
- **Gift Creation Rate**: Number of gifts created per day/week
- **Confirmation Rate**: Percentage of gifts confirmed by recipients
- **Setup Completion Rate**: Percentage of new users completing password setup
- **Email Delivery Rate**: Success rate of notification emails
- **Error Rates**: Common failure points and frequencies

### Logging
- **API Calls**: All gift creation attempts logged
- **User Actions**: Confirmation and setup actions tracked
- **Email Events**: Delivery status and failures recorded
- **Error Details**: Comprehensive error logging with stack traces

## Performance Considerations

### Database Optimization
- **Indexes**: On email, ticket status, gift info fields
- **Transactions**: Ensure data consistency without blocking
- **Batch Updates**: Process multiple tickets efficiently

### Email Delivery
- **Async Processing**: Non-blocking email sending
- **Retry Logic**: Automatic retry for failed deliveries
- **Queue Management**: Handle high-volume gift creation

### Caching Strategy
- **User Lookup**: Cache frequent user searches
- **Ticket Validation**: Cache validation results
- **Template Rendering**: Cache email templates

## Future Enhancements

### Planned Features
- **Bulk Gift Operations**: Gift multiple tickets to different recipients
- **Gift Templates**: Predefined gift messages and configurations
- **Scheduled Gifts**: Set future delivery dates
- **Gift Analytics**: Detailed reporting and insights
- **Mobile App Support**: Native mobile gift management

### Technical Improvements
- **Real-time Updates**: WebSocket notifications for gift status
- **Advanced Search**: Better filtering and search capabilities
- **API Rate Limiting**: Prevent abuse of gift system
- **Multi-language Support**: Additional language options
- **Social Sharing**: Integration with social media platforms

## Troubleshooting Guide

### Admin Issues

#### Gift Creation Fails
1. **Check Permissions**: Ensure admin role access
2. **Validate Input**: Verify all required fields
3. **Check Database**: Verify connectivity and transaction status
4. **Review Logs**: Check error logs for specific issues

#### Tickets Not Showing
1. **Verify Status**: Ensure tickets are 'booked'
2. **Check Ownership**: Confirm user owns the tickets
3. **Gift Status**: Verify tickets haven't been gifted
4. **Event Date**: Check if events are in the future

### Recipient Issues

#### Confirmation Link Not Working
1. **Check Expiration**: Verify link hasn't expired (24 hours)
2. **Token Validation**: Ensure URL is complete and correct
3. **Browser Issues**: Try different browser or clear cache
4. **Contact Admin**: Request new confirmation link

#### Password Setup Problems
1. **Token Expiration**: Check if setup token expired (24 hours)
2. **Email Verification**: Ensure correct email address
3. **Password Requirements**: Meet minimum security standards
4. **Account Status**: Verify account creation was successful

### System Issues

#### Email Delivery Problems
1. **Configuration**: Check email server settings
2. **Spam Filters**: Verify emails aren't blocked
3. **Rate Limiting**: Check email service quotas
4. **Template Issues**: Verify email template syntax

#### Database Errors
1. **Connection**: Check database connectivity
2. **Transactions**: Verify transaction handling
3. **Schema**: Ensure database schema is up to date
4. **Permissions**: Verify database user permissions

## Support Procedures

### Level 1 Support (Basic Issues)
- **Password Reset**: Help users reset passwords
- **Link Expiration**: Explain expiration policies
- **Email Issues**: Guide users through email problems
- **Account Access**: Assist with login problems

### Level 2 Support (Technical Issues)
- **Gift Creation**: Help admins with gift creation
- **System Errors**: Investigate technical failures
- **Database Issues**: Resolve data inconsistencies
- **Email Configuration**: Fix delivery problems

### Level 3 Support (System Issues)
- **Architecture Problems**: Address system design issues
- **Performance Issues**: Optimize system performance
- **Security Issues**: Handle security vulnerabilities
- **Integration Problems**: Resolve third-party issues

## Conclusion

The Gift Ticket System provides a robust, secure, and user-friendly way to transfer tickets between users. With comprehensive validation, secure token handling, and automated user management, it ensures a smooth experience for both administrators and recipients while maintaining data integrity and security.

The system's modular design allows for easy maintenance and future enhancements, making it a scalable solution for ticket management needs.
