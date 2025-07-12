# QR Code Check-in Feature

## 1. Product Requirements Document (PRD)

### 1.1. Overview

The QR Code Check-in feature provides event staff with a fast, reliable, and secure method for validating tickets and managing attendee check-ins at event venues. This system replaces manual check-in processes, reducing wait times and minimizing human error.

### 1.2. Goals

*   **Speed & Efficiency:** Drastically reduce the time it takes to check in an attendee.
*   **Accuracy:** Eliminate double check-ins and ensure that only valid tickets are accepted.
*   **Security:** Restrict check-in functionality to authorized admin users and track which admin performs each scan.
*   **User Experience:** Provide a simple, intuitive interface for event staff that works well in various lighting conditions.

### 1.3. User Stories

*   **As an Event Admin, I want to:**
    *   Quickly scan a QR code on an attendee's ticket to validate it.
    *   Receive immediate, clear feedback on whether a ticket is valid, already used, or invalid.
    *   Use the device's flashlight to scan tickets in low-light environments.
    *   See a history of my recent scans during my session.
    *   Have a fallback option for manual ticket code entry if a QR code is unreadable.
    *   Be automatically redirected back to the scanner page if my session expires and I have to log in again.
*   **As a Ticket Holder, I want to:**
    *   Have my QR code scanned quickly so I can enter the event without delay.
    *   Be confident that my ticket is secure and cannot be used by someone else.

### 1.4. Functional Requirements

*   **Scanner Page (`/checkin/scan`):**
    *   Must be accessible only to authenticated users with the `admin` role.
    *   If an unauthenticated user attempts to access the page, they must be redirected to the admin login page.
    *   After successful login, the user must be redirected back to the `/checkin/scan` page.
    *   The page must display a live camera feed with a designated scanning area.
    *   An overlay/finder guide must be present to help the user position the QR code.
*   **Scanning & Validation:**
    *   The scanner must detect and decode QR codes from the camera feed.
    *   Upon a successful scan, the system will call an API to validate the ticket code.
    *   The system must prevent duplicate scans of the same code within a short time frame (e.g., 1-2 seconds) to avoid false positives.
*   **API Endpoints:**
    *   An endpoint to validate a ticket code (`/api/checkin-app/validate/[ticket-code]`).
    *   An endpoint to perform the check-in (`/api/checkin-app/checkin/[ticket-code]`).
    *   An endpoint to fetch scan history for the logged-in admin (`/api/checkin-app/scan-history`).
*   **Feedback & UI:**
    *   The UI must provide clear visual feedback for success (e.g., green overlay, "Checked In" message) and failure (e.g., red overlay, error message).
    *   The device should vibrate to provide haptic feedback.
    *   A button to toggle the device's flashlight must be available.
    *   A collapsible section should display a history of recent scans performed by the admin.
*   **Data & Tracking:**
    *   Each check-in must be recorded in a `checkinRecords` collection.
    *   The record must include a reference to the ticket, the user (attendee), the event, and the `admin` who performed the check-in.

---

## 2. Implementation Details

### 2.1. Frontend

#### 2.1.1. Core Components

*   **`src/app/(frontend)/checkin/scan/page.client.tsx`**
    *   This is the main client component for the scanner page.
    *   It manages the overall layout, state (feedback overlays, processing state, flashlight), and orchestrates the check-in flow.

*   **`src/components/QRScanner/index.tsx`**
    *   A wrapper around the `@yudiel/react-qr-scanner` library.
    *   Handles debouncing of scans to prevent false positives.
    *   Pre-requests camera permissions on mount to improve UX.
    *   Integrates the library's built-in `Torch` and `Finder` components for flashlight control and the visual scanning guide.

*   **`src/components/QRCode/index.tsx`**
    *   A reusable component for generating QR codes. Used on the public ticket page.

#### 2.1.2. Authentication & Redirects

*   **`src/components/Admin/Login/`**
    *   A custom login view that replaces Payload's default login page.
    *   It uses `useSearchParams` to read the `redirect` query parameter.
    *   After a successful login, it uses `useRouter` to redirect the user back to the originally requested page (e.g., `/checkin/scan`).

### 2.2. Backend

#### 2.2.1. API Endpoints

*   **`POST /api/checkin-app/validate/[ticket-code]`**
    *   Validates a ticket code.
    *   Authenticates the request to ensure the user is an admin.
    *   Gracefully handles requests with or without `eventId` and `eventScheduleId` in the body.
    *   Returns a `200` for valid tickets, `409` for already checked-in tickets, and `404` for invalid tickets.

*   **`POST /api/checkin-app/checkin/[ticket-code]`**
    *   Performs the check-in.
    *   Creates a new `checkinRecords` entry, linking it to the ticket, user, event, and the authenticated admin (`checkedInBy`).

*   **`GET /api/checkin-app/scan-history`**
    *   Fetches the recent check-in history for the currently authenticated admin.
    *   Used by the "Scan History" feature on the scanner page.

*   **`GET /api/checkin-app/verify-auth`**
    *   An internal endpoint used by the middleware to verify a user's authentication status.
    *   Protected by an API key.

#### 2.2.2. Middleware

*   **`src/middleware.ts`**
    *   Protects the `/checkin/*` routes.
    *   If a user is not an authenticated admin, it redirects them to `/admin/login?redirect=/checkin/scan`.

#### 2.2.3. Database

*   **`collections/CheckInRecords`**
    *   A new collection to store all check-in records.
    *   Contains a `checkedInBy` field, which is a relationship to the `admins` collection, to track which admin performed the scan.

---

## 3. Current Status

**Status: `Phase 1 Complete`**

The core QR code check-in functionality has been implemented and is operational.

### 3.1. Completed Features

- **Admin-Only Scanner Page:** A secure, authenticated scanner page is available at `/checkin/scan`.
- **Custom Login Redirect:** Admins who are logged out are correctly redirected back to the scanner page after login.
- **QR Code Scanning:** The page features a robust QR code scanner with a visual finder guide.
- **Ticket Validation & Check-in:** Backend APIs are in place to validate tickets and record check-ins, preventing duplicate scans.
- **Admin Tracking:** All check-ins are associated with the admin who performed the scan.
- **Scanner UI/UX:**
    - Flashlight/torch control for low-light environments.
    - Lazy-loaded scan history for the current admin.
    - Haptic feedback on scan success/failure.
    - A clean, modern UI with clear user feedback.

---

## 4. Future Roadmap

This section outlines planned improvements and new features for the QR check-in system.

### 4.1. Immediate Next Steps

The following features are prioritized for the next development cycle.

*   **Save/Download QR Code:**
    *   **User Story:** As a ticket holder, I want to save the QR code image directly to my phone's photo gallery (on mobile) or download it as a file (on desktop) from the ticket page.
    *   **Implementation Notes:** This will likely involve using a library like `html-to-image` or `dom-to-image` to convert the QR code component (which might include event info) into an image, and then triggering a download.

*   **Scan QR Code from Image:**
    *   **User Story:** As an Event Admin, if an attendee shows me their QR code as an image/screenshot on their phone, I want to be able to upload that image to the scanner page to validate it.
    *   **Implementation Notes:** This will require adding a file input to the scanner page and using the `jsQR` or a similar library on the client-side to decode the QR code from the uploaded image.

### 4.2. Backlog & Potential Improvements

These are features to be considered for future releases.

*   **More Secure Ticket Links:** Investigate methods to make ticket links more secure, such as using single-use tokens or time-limited URLs to prevent sharing.
*   **Ticket Link in Emails:** Include a direct, secure link to the ticket/QR code page in confirmation emails.
*   **Offline Support:** Explore options for offline scanning capabilities for situations with poor or no internet connectivity at the venue. The system could sync data once a connection is re-established.
*   **Advanced Analytics:** Enhance the admin dashboard with more detailed check-in analytics (e.g., check-ins over time, performance per admin).
*   **Guest List View:** Provide admins with a searchable guest list view within the check-in app as another fallback/lookup method. 