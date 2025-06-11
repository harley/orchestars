# Affiliate Login Feature

This document describes the affiliate login feature implementation for the Orchestars platform.

## Overview

The affiliate login feature allows affiliate partners to authenticate and access their dedicated dashboard to manage affiliate links, track performance, and view analytics.

## Architecture

### API Endpoints

#### POST `/api/affiliate/login`
- **Purpose**: Authenticate affiliate users
- **Body**: `{ email: string, password: string }`
- **Response**: User data and JWT token set as HTTP-only cookie
- **Authentication**: Uses existing Users collection with salt/hash verification

#### `logout` action
- **Purpose**: Logout current user
- **Action**: Clears authentication cookie

### UI Components

#### Login Page (`/affiliate/login`)
- **Location**: `src/app/(affiliate)/affiliate/login/page.tsx`
- **Features**:
  - React Hook Form with Zod validation
  - Email and password fields
  - Loading states and error handling
  - Auto-redirect if already authenticated
  - Responsive design with shadcn/ui components

#### Protected Route Component
- **Location**: `src/components/Affiliate/ProtectedRoute.tsx`
- **Purpose**: Wraps affiliate dashboard pages to ensure authentication
- **Features**:
  - Automatic redirect to login if not authenticated
  - Loading state while checking authentication
  - Seamless user experience

#### Enhanced Affiliate Sidebar
- **Location**: `src/components/Affiliate/AffiliateSidebar.tsx`
- **Features**:
  - User information display
  - Logout functionality
  - Navigation menu

### Authentication Context

#### Enhanced Affiliate Provider
- **Location**: `src/providers/Affiliate/index.tsx`
- **Features**:
  - User state management
  - Authentication status tracking
  - Automatic authentication check on app load

## Security Features

1. **Password Hashing**: Uses PBKDF2 with 25,000 iterations (same as PayloadCMS)
2. **JWT Tokens**: Secure token generation with configurable expiration
3. **HTTP-Only Cookies**: Prevents XSS attacks
4. **Account Status Check**: Validates user account is active
5. **Protected Routes**: Automatic redirect for unauthenticated users

## Usage

### For Developers

1. **Adding Protected Pages**: Wrap any affiliate page with `<ProtectedRoute>`
2. **Accessing User Data**: Use `useAffiliateAuthenticated()` hook to get current user
3. **Logout Functionality**: Call logout function from context or use sidebar logout

### For Users

1. Navigate to `/affiliate/login`
2. Enter email and password
3. Upon successful login, redirected to `/affiliate` dashboard
4. Use sidebar logout button to sign out

## Database Requirements

The feature uses the existing `Users` collection with these required fields:
- `email`: User's email address
- `salt`: Password salt for hashing
- `hash`: Hashed password
- `status`: Account status (must be 'active')
- `firstName`, `lastName`, `username`: Optional display fields

## Environment Variables

- `JWT_USER_SECRET`: Secret key for JWT token signing
- `JWT_USER_EXPIRATION`: Token expiration time in milliseconds

## Error Handling

- Invalid credentials return 401 status
- Inactive accounts are rejected
- Network errors show user-friendly messages
- Form validation prevents invalid submissions

## Testing

To test the login feature:

1. Create a user in the PayloadCMS admin panel
2. Set the user status to 'active'
3. Navigate to `/affiliate/login`
4. Login with the user credentials
5. Verify redirect to dashboard and user info display

## Password Reset Feature

### Forgot Password Flow

#### API Endpoints

**POST `/api/affiliate/forgot-password`**
- **Purpose**: Send password reset email to affiliate users
- **Body**: `{ email: string }`
- **Features**:
  - Validates email format
  - Checks if user exists and is active
  - Generates secure reset token (48 characters)
  - Sets 1-hour expiration
  - Sends branded email with reset link
  - Security: Does not reveal if email exists

**POST `/api/affiliate/reset-password`**
- **Purpose**: Reset password using valid token
- **Body**: `{ token: string, password: string }`
- **Features**:
  - Validates token and expiration
  - Checks account status
  - Validates password strength (min 6 characters)
  - Updates password with new salt/hash
  - Clears reset token
  - Auto-login after successful reset

#### UI Components

**Forgot Password Form** (`/components/Affiliate/ForgotPasswordForm.tsx`)
- **Features**:
  - Email validation with Zod schema
  - Professional UI with shadcn/ui components
  - Loading states and error handling
  - Back to login navigation

**Reset Password Page** (`/affiliate/reset-password`)
- **Features**:
  - Token validation on page load
  - Password confirmation matching
  - Strength requirements display
  - Auto-redirect after success
  - Invalid token handling

#### Email Template

- **Branded Design**: Orchestars affiliate portal styling
- **Security Features**:
  - Clear expiration notice (1 hour)
  - Security warning for unauthorized requests
  - Support contact information
- **Responsive**: Works on all email clients
- **Accessible**: Clear call-to-action button

#### Security Features

1. **Token Security**: 48-character random tokens
2. **Time-Limited**: 1-hour expiration
3. **Single Use**: Tokens cleared after use
4. **Account Validation**: Only active accounts can reset
5. **No Information Disclosure**: Same response regardless of email existence
6. **Password Strength**: Minimum 6 characters required

### Usage Instructions

#### For Users
1. Click "Forgot your password?" on login page
2. Enter email address
3. Check email for reset link
4. Click link or copy to browser
5. Enter new password (confirm)
6. Automatically logged in after reset

#### For Developers
- Use `validateAffiliateResetPasswordToken()` utility for server-side validation
- Email templates are customizable in the API route
- Token generation can be adjusted for different security requirements

## Future Enhancements

- Two-factor authentication
- Session management improvements
- Remember me functionality
- Social login integration
- Password strength meter
- Account lockout after failed attempts
