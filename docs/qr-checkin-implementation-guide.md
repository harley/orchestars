# QR Check-in Implementation Guide

*This document supplements `feature-qr-checkin.md` with detailed technical implementation guidance*

⸻

## 🎯 Infrastructure Assessment

**EXCELLENT NEWS**: Your existing infrastructure perfectly matches the QR check-in requirements! 

### Existing APIs (Production Ready)
- ✅ `POST /api/checkin-app/validate/[ticket-code]` - Validates tickets exactly as specified
- ✅ `POST /api/checkin-app/checkin/[ticket-code]` - Performs check-in exactly as specified  
- ✅ Admin authentication with role-based access (admin/super-admin/event-admin)
- ✅ Comprehensive error handling with 14+ error codes (CHECKIN001-014)
- ✅ SQL injection protection via parameterized queries
- ✅ Multi-language support (English/Vietnamese) with i18n system
- ✅ Email system with Resend (prod) + Nodemailer (dev) + queue processing

### Data Models (Ready to Use)
```typescript
// Tickets Collection - Already Perfect
{
  ticketCode: string,           // QR payload (uppercase)
  seat: string,                // Display on ticket page
  attendeeName: string,        // Display on ticket page
  event: Event,                // For ticket details
  user: User,                  // For access control
  checkedIn: boolean,          // Validation logic
  checkedInAt: Date,           // Audit trail
  // ... extensive other fields
}

// CheckinRecords Collection - Already Perfect
{
  ticket: Ticket,              // Reference
  admin: Admin,                // Who performed check-in
  checkedInAt: Date,           // When
  // ... audit fields
}
```

### Authentication System (Ready to Use)
- JWT-based sessions with HTTP-only cookies
- Admin roles: `admin`, `super-admin`, `event-admin` 
- Function: `isAdminOrSuperAdminOrEventAdmin()` - Perfect for scanner access
- Redirect flows already handle unauthorized access

### Key Advantage
**Zero backend changes required** - APIs match your specification exactly:
- `POST /validate/:ticketCode` → `POST /api/checkin-app/validate/[ticket-code]` ✅
- `POST /checkin/:ticketCode` → `POST /api/checkin-app/checkin/[ticket-code]` ✅

⸻

## 📋 Enhanced Implementation Plan (6-8 hours)

### Phase 1: Dependencies & Setup (0.5 hours)

**Install QR Libraries**
```bash
pnpm add qrcode jsqr @types/qrcode @types/jsqr
```

**Verify Existing Infrastructure**
- Test existing `/api/checkin-app/validate/[ticket-code]` endpoint
- Confirm admin authentication works on target pages
- Review current email template structure

### Phase 2: Ticket Page Implementation (2 hours)

**Create Ticket Display Page**
- **File**: `src/app/(frontend)/ticket/[ticketCode]/page.tsx`
- **Auth**: Public access (no login required)
- **Data**: Fetch via Payload REST API using existing ticket model
- **QR**: Generate using `qrcode` library with plain ticketCode payload

**QR Code Component**
- **File**: `src/components/QRCode/index.tsx`  
- **Features**:
  - Canvas-based rendering for better mobile compatibility
  - Error boundaries for failed generation
  - Responsive sizing (small for email, large for display)
  - Fallback to text code if QR generation fails

**UI Requirements**
- Event title, date, venue
- Seat number and attendee name
- Large, scannable QR code
- Marketing slots: "Show info", "Merch", "Upcoming events"
- Mobile-first responsive design

### Phase 3: Email Template Update (1 hour)

**Modify Existing Email Template**
- **File**: `src/mail/templates/TicketDisneyEventBookedEmail.ts`
- **Change**: Replace embedded QR with "My Ticket" button
- **URL**: `https://orchestars.com/ticket/{ticketCode}`
- **Styling**: Match existing email design system

**Testing Strategy**
- Use existing `sendTicketMail()` function
- Test with local Inbucket setup (already configured)
- Verify button rendering across email clients

### Phase 4: Scanner Implementation (3 hours)

**Scanner Page Setup**
- **File**: `src/app/(frontend)/checkin/scan/page.tsx`
- **Auth**: Admin-only using existing `isAdminOrSuperAdminOrEventAdmin`
- **Layout**: Full-screen camera overlay
- **Permissions**: Handle camera access gracefully

**QR Scanner Component**
- **File**: `src/components/QRScanner/index.tsx`
- **Camera**: `navigator.mediaDevices.getUserMedia()` with rear camera preference
- **Detection**: `jsQR` in `requestAnimationFrame` loop
- **Performance**: Debounce scans (500ms) to prevent spam

**API Integration Flow**
```typescript
// 1. Scan QR → Extract ticketCode
const ticketCode = qrData.toUpperCase();

// 2. Validate ticket
const validateResponse = await fetch(`/api/checkin-app/validate/${ticketCode}`, {
  method: 'POST',
  body: JSON.stringify({ eventId, eventScheduleId })
});

// 3. Handle validation result
if (validateResponse.status === 200) {
  // Show ticket details, confirm check-in
  const checkinResponse = await fetch(`/api/checkin-app/checkin/${ticketCode}`, {
    method: 'POST', 
    body: JSON.stringify({ eventDate })
  });
  
  if (checkinResponse.status === 200) {
    showSuccessFeedback(); // Green screen + vibrate
  }
} else {
  showErrorFeedback(validateResponse); // Red screen + error
}
```

**Feedback System**
- **Success**: Green full-screen overlay (1 second) + `navigator.vibrate([200])`
- **Error**: Red full-screen overlay (2 seconds) + different vibration pattern
- **Audio**: Optional beep sounds using Web Audio API
- **Auto-reset**: Return to scanning after feedback

### Phase 5: Error Handling & Polish (1.5 hours)

**Implement Existing Error Codes**
```typescript
// Map existing backend errors to scanner UX
const errorMessages = {
  'CHECKIN001': 'Ticket not found',
  'CHECKIN003': 'Already checked in at {checkedInAt}',  
  'CHECKIN005': 'Unauthorized access',
  'CHECKIN007': 'Invalid event',
  // ... handle all 14 error codes
};
```

**Multi-language Support**
- Use existing i18n system
- Add scanner messages to `src/payload-config/i18n/locales/en.json`
- Add Vietnamese translations to `vi.json`

**Manual Entry Fallback**
- **Button**: "Manual Entry" on scanner page
- **Link**: Navigate to existing `/checkin/validates` page  
- **Context**: Pass current event/schedule if available

### Phase 6: Testing & Deployment (1 hour)

**Cross-Device Testing**
- **iOS Safari**: Camera access and QR detection
- **Android Chrome**: Performance and vibration
- **Laptop**: Webcam functionality for desk staff
- **Poor Network**: Error handling and timeouts

**Edge Cases**
- Camera permission denied
- Network connectivity issues  
- Multiple tickets for same seat (status 300 handling)
- Malformed QR codes
- Already checked-in tickets

**Deployment Checklist**
- Test on staging with real ticket codes
- Verify email templates in production email system
- Confirm HTTPS enforcement for camera access
- Test admin authentication on production

⸻

## 🔧 Technical Implementation Details

### File Structure
```
src/
├── app/(frontend)/
│   ├── ticket/[ticketCode]/
│   │   └── page.tsx                    # Ticket display page
│   └── checkin/scan/
│       └── page.tsx                    # QR scanner page
├── components/
│   ├── QRCode/
│   │   └── index.tsx                   # QR generation component
│   └── QRScanner/
│       └── index.tsx                   # Camera scanner component
├── hooks/
│   ├── useCamera.ts                    # Camera permission handling
│   └── useQRScanner.ts                 # QR detection logic
└── mail/templates/
    └── TicketDisneyEventBookedEmail.ts # Updated email template
```

### Key Dependencies
```json
{
  "qrcode": "^1.5.3",           // QR generation
  "jsqr": "^1.4.0",             // QR detection  
  "@types/qrcode": "^1.5.5",    // TypeScript support
  "@types/jsqr": "^1.4.0"       // TypeScript support
}
```

### Performance Considerations

**QR Generation**
- Use canvas rendering for better mobile performance
- Cache generated QR codes in memory
- Optimize size: 256x256px for mobile, 512x512px for desktop

**Camera Scanner**
- Target 30fps detection loop with `requestAnimationFrame`
- Use rear camera by default: `facingMode: 'environment'`
- Implement graceful fallback for devices without camera

**API Optimization**  
- Debounce rapid scans to prevent API spam
- Prefetch validation on QR detection before user confirmation
- Implement exponential backoff for network failures

### Security Implementation

**Camera Access**
- Request permissions gracefully with clear messaging
- Handle permission denied scenarios
- HTTPS enforcement for camera API access

**QR Code Security**
- Plain ticketCode payload (as specified for MVP)
- Server-side validation always performed
- No client-side security assumptions

**Admin Access Control**
- Reuse existing `isAdminOrSuperAdminOrEventAdmin()` function
- Redirect unauthorized users to login
- Maintain session state across scanner usage

### Error Handling Strategy

**Camera Errors**
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    showCameraPermissionHelp();
  } else if (error.name === 'NotFoundError') {
    showNoCameraAvailable();
  }
}
```

**API Errors**
```typescript
// Use existing error handling pattern
const response = await checkInTicket(ticketCode);
if (response.error) {
  const message = handleNextErrorMsgResponse(response.error);
  showErrorFeedback(message);
}
```

**Network Errors**
- Show offline indicator
- Queue failed requests for retry
- Provide manual entry fallback

⸻

## 🎯 Success Criteria & Testing

### Functional Testing
- [ ] QR generation works for all ticket types
- [ ] Camera access works on iOS Safari and Android Chrome  
- [ ] Scanner detects QR codes in various lighting conditions
- [ ] All existing error codes display appropriate feedback
- [ ] Manual entry fallback functions correctly
- [ ] Email "My Ticket" button links work properly

### Performance Testing
- [ ] QR detection latency < 500ms in good lighting
- [ ] API response time < 2 seconds for check-in flow
- [ ] Camera stream stable at 30fps
- [ ] Memory usage reasonable during extended scanning

### User Experience Testing
- [ ] Scanner provides clear visual feedback
- [ ] Error messages are helpful and actionable
- [ ] Ticket page loads quickly and displays correctly
- [ ] Mobile responsive design works on various screen sizes

### Security Testing
- [ ] Admin authentication required for scanner access
- [ ] Unauthorized users redirected appropriately
- [ ] QR codes contain only expected ticket codes
- [ ] API endpoints validate permissions correctly

⸻

## 🚀 Quick Start Commands

```bash
# Install dependencies
pnpm add qrcode jsqr @types/qrcode @types/jsqr

# Start development server
pnpm dev

# Test email templates locally
# (Inbucket available at http://localhost:54324)

# Deploy to staging
# (Follow existing deployment process)
```

### Recommended Development Order
1. **QR Generation**: Start with ticket page and QR component
2. **Email Integration**: Update templates and test locally  
3. **Scanner Core**: Implement camera and QR detection
4. **API Integration**: Connect to existing validation/checkin endpoints
5. **Polish**: Add feedback, error handling, and manual fallback
6. **Testing**: Cross-device and edge case validation

⸻

*This implementation leverages your excellent existing infrastructure to deliver the QR check-in feature efficiently and reliably.* 