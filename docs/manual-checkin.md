# Manual Ticket Check-in Feature

## 1. Product Requirements Document (PRD)

### 1.1. Overview

The **Manual Check-in** feature allows event staff to verify and check in attendees without scanning a QR code.  This flow is designed for edge-cases where a QR code is unavailable or unreadable—for example, when a guest only has a seat number or a printed ticket code.  Manual Check-in extends the existing QR Check-in system by providing an input-driven interface that is fast, secure, and resistant to human error.

### 1.2. Goals

* **Fallback:** Provide a reliable alternative when QR scanning fails or the attendee does not have a scannable code.
* **Speed & Accuracy:** Enable staff to locate the correct ticket with minimal keystrokes and prevent duplicate or invalid check-ins.
* **Security:** Restrict manual check-in to authenticated admins and log which admin performed each action.
* **Context Awareness:** Require admins to specify the event *and* schedule (date/time slot) before searching by seat—ensuring the correct ticket is validated.

### 1.3. User Stories

* **As an Event Admin, I want to:**
  * Open a *Manual Entry* form from the `/checkin/scan` page.
  * Select the **Event** and **Schedule/Date** I am working on.
  * Enter either a **Ticket Code**, a **Seat Number**, **Phone Number**, or **Email** to locate an attendee.
  * See the attendee’s name, ticket status, and seat details before final confirmation.
  * Confirm the check-in manually and receive immediate feedback (success, already checked in, invalid).
  * Fall back to QR scanning at any time.

* **As a Ticket Holder, I want to:**
  * Be checked in quickly even if my QR code cannot be scanned.
  * Trust that my ticket cannot be reused after manual check-in.

### 1.4. Functional Requirements

* **Access Control:**
  * Manual Check-in is available only to authenticated admins (same rules as QR scanning).
  * Unauthenticated users are redirected to `/admin/login` and back after login (`?redirect=/checkin/events`).

* **UI & Flow:**
  * A **navigation toggle** is present on all check-in pages (`/checkin/scan`, `/checkin/events`, and `/checkin/validates`), allowing admins to seamlessly switch between QR and manual entry modes.
  * Clicking the **“Manual Entry”** toggle navigates to `/checkin/events` for event/schedule selection, and then to `/checkin/validates`.
  * The manual validation flow (`/checkin/validates`) proceeds as follows:
    1. **Event & Schedule Selection** – required when checking in by *seat number*, *phone*, or *email* (the page reads `eventId` and `scheduleId` from the URL and caches them in `localStorage`).
    2. **Tab Selector & Input** – choose **“By Ticket Code”**, **“By Seat”**, **“By Email”**, or **“By Phone”** and type the value.
    3. **Look Up** – triggers a backend validation request; a 2-second client-side throttle prevents accidental double submissions.
    4. **Confirmation Screen / Multi-match List** – shows the visitor details (or a list when multiple tickets are found) with a **“Check-in”** button.
  * Clear success (green) or failure (red) feedback overlays similar to the QR flow.
  * The interface re-focuses the input field after each action to streamline multiple entries.

* **Validation & Duplicate Prevention:**
  * The backend must prevent duplicate check-ins (same ticket cannot be checked in twice).
  * A grace window (≈1–2 s) avoids accidental double submits.

* **API Endpoints:**
  * `POST /api/checkin-app/validate/<ticket-code>` – unchanged; used when the input looks like a ticket code.
  * `POST /api/checkin-app/validate-seat` – unchanged; payload `{ eventId, scheduleId, seatNumber }` returns the corresponding ticket code if found.
  * `POST /api/checkin-app/validate-contact` – **new**; payload `{ eventId, scheduleId, email?, phoneNumber? }` returns tickets matching the contact info for that event.
  * `POST /api/checkin-app/checkin/<ticket-code>` – performs the actual check-in.

* **Data & Tracking:**
  * Each manual check-in is stored in `checkinRecords`, with `checkedInBy` linked to the admin.
  * A boolean `manual` flag distinguishes manual vs. QR check-ins for analytics.

---

## 2. Implementation Details

### 2.1. Frontend

* **Route / Component Structure**
  * `src/app/(checkin)/checkin/validates/page.client.tsx` – dedicated manual check-in page (linked from the scanner).
  * Re-uses shared **feedback** & **history** components from the QR scanner.
  * Employs a 2-second client-side **throttle** to prevent duplicate submissions.

* **Event & Schedule Context**
  * The selected event and schedule are passed via URL query parameters (`eventId`, `scheduleId`) and cached in `localStorage` for subsequent searches.
  * Changing the event or schedule clears the cached values to avoid cross-event mistakes.

* **Error Handling**
  * 404 → *Invalid seat/ticket*.
  * 409 → *Already checked in* (show last check-in time/admin).

### 2.2. Backend

* **Seat Lookup Endpoint (`validate-seat`)**
  * Accepts `{ eventId, scheduleId, seatNumber }`.
  * Finds the ticket for the given seat within that schedule.
  * Returns `404` if not found.
  * Otherwise delegates to the existing **validate** logic for consistent responses.

* **Contact Lookup Endpoint (`validate-contact`)**
  * Accepts `{ eventId, scheduleId, email?, phoneNumber? }`.
  * Finds all tickets matching the exact email or phone number for that event schedule.
  * Returns `404` if not found.

* **Middleware**
  * Existing `src/middleware.ts` covers `/checkin/*`; no changes required.

---

## 3. Current Status

The manual check-in flow is fully functional and aligned with the v2 QR scanner:

* UI parity with the scanner page (responsive dark/light themes) is complete.
* `validate-seat` endpoint and related migration are active in production.
* Duplicate prevention is implemented via a 2-second throttle on both **validate** and **check-in** actions.
* `checkinRecords` now includes a `manual` boolean flag (see migration `20250713_044021_add_manual_column_to_checkin_records.*`) and records `eventDate` and `checkedInBy` for every manual action.

No outstanding tasks for v1; future work is tracked in the *Future Enhancements* section.

---

## 4. Future Enhancements

* **Bulk Import** – allow uploading a CSV of seat numbers for batch check-in in low-connectivity situations.
* **Offline Mode** – mirror QR-scanner roadmap to enable offline manual entry.
* **Search Suggestions** – auto-complete seat numbers based on partial input.
* **Voice Entry** – explore microphone input for hands-free seat entry. 

---

## 5. UI/UX Improvements (Dashboard Enhancement)

### 5.1. Overview
Recent improvements to the manual check-in dashboard focus on creating a more prominent, user-friendly interface that reduces errors and enhances the admin experience.

### 5.2. Key Improvements

#### Prominent Layout
- **Centered Card Design**: The dashboard now uses a centered, shadowed card layout (`max-w-lg`, `shadow-2xl`) for better focus
- **Enhanced Typography**: Larger title (`text-3xl`), better spacing, and centered alignment for improved hierarchy
- **Responsive Design**: Maintains functionality across different screen sizes while emphasizing key elements

#### Unified Navigation Toggle
- **Seamless Switching**: A persistent navigation toggle is now present across all check-in pages.
- **Improved Workflow**: Admins can instantly switch from manual look-up back to QR scanning (or vice-versa) without navigating back through multiple pages, significantly improving efficiency.

#### Date Safety Features
- **Date Mismatch Warning**: Automatic detection when selected event date differs from today's date
- **Visual Warning Banner**: Red banner with alert triangle icon warns admins before proceeding with wrong-date check-ins
- **Smart Comparison**: Uses ISO date strings for accurate date comparison regardless of timezone

#### Information Display
- **Hidden Technical IDs**: Event ID and Schedule ID are no longer visible to reduce clutter
- **Formatted Event Details**: Clean display of:
  - Event title
  - Date (from schedule)
  - Time (placeholder: "TBA" - can be enhanced with actual time data)
  - Location (pulled from localStorage)

#### Enhanced Input Experience
- **Modern Tab Design**: Rounded tabs with better visual feedback for active state
- **Improved Input Fields**: Enhanced with:
  - Hover shadows (`hover:shadow-md`)
  - Better transitions
  - Consistent styling across ticket code and seat number inputs
- **Prominent Action Button**: 
  - Larger size (`py-4`)
  - Uppercase text with letter spacing
  - Enhanced hover effects

#### Multi-Ticket Selection UI
- **Clear Ticket List**: When multiple tickets match a search (e.g., by email or phone), a list is shown for the admin to select which ticket to check in.
- **Row Layout**:
  - **Left (top row):** `[Seat]` (blue badge), `[Ticket Class]` (colored badge using `getTicketClassColor(ticket.ticketPriceInfo)`), `[Ticket Code]` (monospace)
  - **Right (top row):** `[Check In]` button (if not checked in) or `[Checked In]` badge (with check-in time if available)
  - **Below:** Attendee name (left), order code (right-aligned, thin/small font)
- **Visual Feedback:** Only the button for the ticket being checked in is disabled and shows "Checking..."; other buttons remain active.
- **Badges:** The "Ready" badge is removed. Only the "Checked In" badge is shown, right-aligned, and displays the check-in time if available.
- **Color Consistency:** The ticket class badge uses the correct color and text color from `getTicketClassColor(ticket.ticketPriceInfo)`, matching the rest of the app.

### 5.3. Technical Implementation

#### State Management
```typescript
const [showDateWarning, setShowDateWarning] = useState(false);
const [eventLocation, setEventLocation] = useState('');
const [eventTime] = useState('TBA');
```

#### Date Validation Logic
```typescript
// Date mismatch check
if (scheduleDate) {
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = new Date(scheduleDate).toISOString().split('T')[0];
  setShowDateWarning(today !== selectedDate);
}
```

#### Warning Component
```jsx
{showDateWarning && (
  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6 flex items-center">
    <AlertTriangle className="w-5 h-5 mr-2" />
    <p>Warning: Selected event date is not today. Double-check before proceeding.</p>
  </div>
)}
```

### 5.4. User Experience Benefits

1. **Error Prevention**: Date warnings help prevent accidental check-ins to wrong events
2. **Reduced Cognitive Load**: Hidden technical IDs focus attention on relevant information
3. **Improved Accessibility**: Better contrast, larger interactive elements, clear visual hierarchy
4. **Professional Appearance**: Modern styling reduces the "ugly" appearance of previous iteration
5. **Consistent Branding**: Maintains dark/light theme support throughout

### 5.5. Future Enhancements

- **Time Integration**: Replace "TBA" placeholder with actual event schedule times
- **Location Validation**: Add location mismatch warnings for multi-venue events
- **Quick Actions**: Add keyboard shortcuts for power users
- **Offline Indicators**: Visual feedback for network status during check-ins

--- 