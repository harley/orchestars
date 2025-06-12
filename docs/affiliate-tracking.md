# Affiliate Click Tracking

This document describes the affiliate click tracking system that automatically logs when users click on affiliate links.

## Overview

The affiliate tracking system captures and logs clicks on affiliate links to provide analytics and attribution data for affiliate partners. It works by:

1. **Middleware Detection**: The middleware detects `affiliate` query parameters in URLs
2. **Session Management**: Creates unique session IDs to prevent duplicate tracking
3. **Automatic Logging**: Asynchronously logs click data to the database
4. **Analytics**: Provides detailed analytics through API endpoints

## URL Format

Affiliate links follow this format:
```
http://localhost:3000/events/hxh-future-event?apc=EARLYBIRD&utm_source=facebook&utm_medium=affiliate&utm_campaign=summer-promo&utm_term=orchestars
```

### Parameters:
- `apc` (optional): Promotion code associated with the link
- `utm_*` (optional): UTM tracking parameters

## How It Works

### 1. Middleware Processing (`src/middleware.ts`)

When a user visits a URL with an `affiliate` parameter:

1. **Parameter Detection**: Middleware detects the `affiliate` parameter
2. **Cookie Storage**: Stores affiliate data in cookies for 7-day attribution
3. **Session Check**: Checks if this is a new session (not already tracked)
4. **Async Logging**: Triggers affiliate click logging via internal API call

### 2. Click Logging (`src/app/(affiliate)/api/affiliate/track/route.ts`)

The internal API endpoint:

1. **Validation**: Validates the affiliate code exists and is active
2. **Duplicate Prevention**: Checks for existing logs with the same session ID
3. **Data Collection**: Captures IP, user agent, referrer, device info, UTM parameters
4. **Database Storage**: Creates a record in `affiliate-click-logs` collection

### 3. Data Storage (`src/collections/Affiliate/AffiliateClickLogs.ts`)

Each click log contains:
- **affiliateUser**: Reference to the affiliate user
- **affiliateLink**: Reference to the affiliate link
- **sessionId**: Unique session identifier
- **ip**: Client IP address
- **userAgent**: Browser user agent string
- **referrer**: HTTP referrer header
- **moreInformation**: JSON object with additional data:
  - Device information (mobile/tablet/desktop)
  - Browser and OS detection
  - Promo code used
  - UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
  - Original URL
  - Timestamp

## Session Management

### Session Duration
- **Tracking Session**: 30 minutes (prevents duplicate logging)
- **Attribution Window**: 7 days (affiliate gets credit for conversions)

### Duplicate Prevention
The system prevents duplicate click logging by:
1. Creating unique session IDs for each new visitor
2. Storing session ID in cookies for 30 minutes
3. Checking database for existing logs with same session ID
4. Only logging new sessions

## Security Features

### Internal API Protection
The tracking API endpoint is protected:
- Requires `X-Api-Key` header matching configured value
- Only accepts requests from middleware
- Validates affiliate codes before logging

### Access Control
Click logs have restricted access:
- **Affiliates**: Can only view their own click logs
- **Admins**: Can view all click logs
- **Updates**: Prevented to maintain data integrity
- **Deletes**: Only admins can delete logs

## Device Detection

The system automatically detects:
- **Device Type**: Mobile, tablet, or desktop
- **Browser**: Chrome, Firefox, Safari, Edge
- **Operating System**: Windows, macOS, Linux, Android, iOS

## Cookie Management

### Affiliate Cookies (7 days)
- `apc`: Associated promo code

### Session Cookies (30 minutes)
- `affiliate_session`: Unique session identifier

### UTM Cookies (1 day)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

## Testing

To test the affiliate tracking:

1. **Create an affiliate link** in the admin panel
2. **Visit the link** with affiliate parameters
3. **Check the logs** via the analytics API
4. **Verify session handling** by visiting the same link again

Example test URL:
```
http://localhost:3000/events/test-event?affiliate=TEST123&apc=SAVE10&utm_source=test
```

## Troubleshooting

### Common Issues

1. **Clicks not being logged**:
   - Check if affiliate code exists and is active
   - Verify middleware is running on the correct paths
   - Check browser console for errors

2. **Duplicate clicks**:
   - Verify session cookie is being set
   - Check if session ID is unique
   - Ensure 30-minute session window is working

3. **Missing analytics data**:
   - Confirm affiliate user has proper permissions
   - Check if click logs exist in database
   - Verify API authentication

### Debug Mode

Enable debug logging by checking the server console for:
- `Affiliate click logged: {code} - Session: {sessionId}`
- `Duplicate click detected for session: {sessionId}`
- Error messages for failed tracking attempts

## Performance Considerations

- **Async Processing**: Click logging is asynchronous and doesn't block page loads
- **Session Caching**: Uses cookies to avoid database lookups for duplicate checks
- **Batch Analytics**: Analytics queries are optimized for large datasets
- **Index Usage**: Session IDs and affiliate codes are indexed for fast lookups
