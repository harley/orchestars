# Access Control System

## Current Implementation

### Authentication
- Using Payload CMS built-in authentication
- Based on Users collection
- Email-based authentication only
- Phone numbers stored but not used for authentication
- Basic role selection without enforced access control

### User Types & Roles
```typescript
type UserRole = 'admin' | 'super-admin' | 'customer'
```

Current roles exist in schema but not fully enforced in access control.

### Event Status Flow
```typescript
const EVENT_STATUS = {
  draft: 'draft',                     // Event being prepared, not visible
  published_upcoming: 'published_upcoming',     // Announced, tickets not on sale
  published_open_sales: 'published_open_sales', // Open for ticket sales
  completed: 'completed',             // Event has ended
  cancelled: 'cancelled'              // Event called off
}
```

### Collections Access
- **Users**: 
  - Create/Read/Update/Delete: Authenticated users only
  - Admin access: Authenticated users only
  - No role-based restrictions currently

- **Events**:
  - No explicit access control defined yet
  - Status transitions managed manually by admin
  - Public access to published events implied

- **Tickets**:
  - Linked to users, events and order items via foreign keys
  - No explicit access control defined yet
  - Implicit access through order ownership

- **Orders & Order Items**:
  - No explicit access control defined yet
  - Implicit access through user ownership

- **Seat Holdings**:
  - Temporary seat reservations
  - Tracks user info, IP address and expiration
  - No explicit access control defined yet

### API Endpoints & Validation

#### Seat Holding Endpoints
- **/api/seat-holding/seat**
  - POST: Creates/updates seat holding
  - Validates:
    - Required fields (seatName, eventId, eventScheduleId)
    - Event existence and schedule validity
    - Seat availability
    - Expiration time (30 minutes)
  - Tracks IP and user agent
  - No authentication required currently

- **/api/seat-holding/ticket-class**
  - POST: Manages ticket class reservations
  - Validates:
    - Required fields (ticketClasses, eventId, eventScheduleId)
    - Event existence and schedule validity
    - Ticket class availability and quantity limits
    - Expiration time (30 minutes)
  - Tracks IP and user agent
  - No authentication required currently

#### Payment Endpoints
- **/api/zalopay/**
  - POST /getbanks: Gets bank list
  - POST /query: Checks payment status
  - POST /callback: Payment webhook
  - Uses HMAC validation with ZaloPay keys
  - No authentication required (payment flow)
  - Validates transaction signatures

#### Order Endpoints
- **/api/bank-transfer/order**
  - POST: Creates new orders
  - Validates:
    - Customer information
    - Event and ticket availability
    - Promotion code validity
    - Transaction details
  - Uses database transactions
  - No authentication required currently

#### Preview Endpoint
- **/next/preview**
  - GET: Preview mode for content
  - Requires authentication
  - Validates preview secret
  - Checks user permissions

#### Promotion Endpoint
- **/api/promotion**
  - POST: Applies promotion codes
  - Validates:
    - Code existence and validity
    - Event association
    - Usage limits and expiration
    - Current redemption count
  - No authentication required currently

### Current Validation Implementations

#### Seat Availability Checks
```typescript
// Validates seat availability against:
- Existing seat holdings
- Booked tickets
- Pending payment tickets
- Held tickets
```

#### Ticket Class Validation
```typescript
// Validates ticket class against:
- Maximum quantity limits
- Current bookings
- Pending payments
- Event schedule validity
```

#### Promotion Validation
```typescript
// Validates promotions against:
- Active status
- Valid date range
- Maximum redemptions
- Per-user limits
- Event association
```

#### Transaction Security
- Database transactions for order creation
- HMAC validation for payment callbacks
- IP and user agent tracking
- Expiration time enforcement

## Planned Improvements [TBD]

### 1. Role Separation & Permissions
- [ ] Implement proper role-based access control (RBAC)
- [ ] Create dedicated admin/staff user collection
- [ ] Define granular permissions per role
- [ ] Add organization-level access control
- [ ] Implement event ownership and assignment

### 2. Event Access Control
- [ ] Public read access for published events only
- [ ] Admin/staff write access based on roles
- [ ] Status transition validation rules
- [ ] Venue/organizer specific access

### 3. Ticket Access Control
- [ ] Customer access to own tickets only
- [ ] Staff access based on event assignment
- [ ] Seat holding validation rules
- [ ] Order status-based restrictions

### 4. API Security Enhancements
- [ ] Add authentication to seat holding endpoints
- [ ] Implement rate limiting for all public endpoints
- [ ] Add request validation middleware
- [ ] Implement proper error handling
- [ ] Add logging for sensitive operations
- [ ] Add IP-based restrictions for admin endpoints
- [ ] Add request sanitization
- [ ] Implement CORS properly
- [ ] Add API versioning

### 5. General Security Enhancements
- [ ] Add rate limiting for authentication
- [ ] Implement session management
- [ ] Add audit logging for sensitive operations
- [ ] Add 2FA for admin accounts
- [ ] IP-based access restrictions for admin panel
- [ ] Implement secure password policies
- [ ] Add brute force protection

## Questions for Review
1. What specific permissions are needed for event organizers vs venue staff?
2. Should we implement organization/venue-based access control?
3. What audit logging requirements exist?
4. What are the requirements for customer service staff access?
5. What rate limiting thresholds should be set for public endpoints?
6. Should we implement IP whitelisting for admin endpoints?
7. What is the session timeout policy?

## Implementation Priority
1. Role separation (Admin vs Customer)
2. Event access control
3. Ticket access control
4. API security enhancements
5. General security enhancements

## Notes
- Current system was built rapidly (1-week timeline)
- Focus on maintaining security while implementing improvements
- Need to ensure backward compatibility during migration
- Phone numbers currently stored but not used for authentication
- Manual status transitions by admin need validation rules
- Public endpoints need rate limiting and validation
- Payment endpoints use HMAC validation but need additional security
- Database transactions used for critical operations
- Input validation exists but needs standardization
- Error handling needs improvement
- Logging system needs enhancement 