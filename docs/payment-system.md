# Payment System Documentation

## Overview

The OrcheStars payment system integrates with ZaloPay payment gateway to handle ticket purchases. The system follows a secure callback-based architecture to process payment confirmations and update order statuses.

## ZaloPay Integration

### Configuration

Payment configuration is managed in `src/config/payment.ts`:

```typescript
export const ZALO_PAYMENT = {
  APP_ID: process.env.ZALO_APP_ID,
  KEY1: process.env.ZALO_KEY1,
  KEY2: process.env.ZALO_KEY2,
  ENDPOINT: process.env.ZALO_API_URL,
  REDIRECT_URL: `${APP_BASE_URL}/payment/result`,
  CALLBACK_URL: `${APP_BASE_URL}/api/zalopay/callback`,
}
```

### Environment Variables

Required environment variables for ZaloPay integration:

- `ZALO_APP_ID`: ZaloPay application ID
- `ZALO_KEY1`: ZaloPay key for order creation
- `ZALO_KEY2`: ZaloPay key for callback verification
- `ZALO_API_URL`: ZaloPay API endpoint (sandbox/production)
- `APP_BASE_URL`: Application base URL for callbacks

## Payment Callback System

### Endpoint: `/api/zalopay/callback`

The payment callback endpoint (`src/app/(payload)/api/zalopay/callback/route.ts`) handles payment confirmations from ZaloPay.

#### Request Flow

1. **Callback Reception**: ZaloPay sends POST request with payment result
2. **MAC Verification**: Validates request authenticity using HMAC-SHA256
3. **Payment Processing**: Updates payment and order status in database
4. **Error Handling**: Comprehensive error logging and notification system

#### Request Format

ZaloPay sends callback data in this format:

```json
{
  "data": "{\"app_id\":2554,\"app_trans_id\":\"...\",\"app_user\":\"...\",\"amount\":50000,\"app_time\":1234567890,\"embed_data\":\"{}\",\"item\":\"[{\\\"itemid\\\":\\\"item1\\\",\\\"itemname\\\":\\\"Item 1\\\",\\\"itemprice\\\":50000,\\\"itemquantity\\\":1}]\",\"zp_trans_id\":123456789,\"server_time\":1234567890,\"channel\":1,\"merchant_user_id\":\"\",\"user_fee_amount\":0,\"discount_amount\":0}",
  "mac": "computed_hmac_signature"
}
```

#### Security Validation

The callback implements HMAC-SHA256 verification:

```typescript
const { data: dataStr, mac: reqMac } = body
const computedMac = CryptoJS.HmacSHA256(dataStr, ZALO_PAYMENT.KEY2).toString()

if (reqMac !== computedMac) {
  return jsonResponse(-1, 'Mac verification failed')
}
```

#### Payment Processing Logic

1. **Payment Lookup**: Find payment record by `app_trans_id`
2. **Status Validation**: Ensure payment is in 'processing' status
3. **Database Transaction**: Use transaction for atomic updates
4. **Payment Update**: Update payment status to 'paid' with callback data
5. **Automatic Triggers**: Payment hooks handle order and ticket status updates

#### Response Format

The callback returns standardized responses:

```typescript
// Success
{ return_code: 1, message: "Success" }

// Failure
{ return_code: 0, message: "Error message" }

// Invalid MAC
{ return_code: -1, message: "Mac verification failed" }
```

## Error Handling & Monitoring

### Error Logging

The system implements comprehensive error logging:

- **Action Type**: `PAYMENT_CALLBACK_ERROR`
- **Error Details**: Full error stack and message
- **Context Data**: Request body, callback data, payment info
- **Database Storage**: Errors stored in Logs collection

### Email Notifications

Failed payment callbacks trigger immediate email alerts:

- **Recipients**: Admin team (configured in `EMAIL_ADMIN_CC`)
- **Template**: `ZalopayCallbackError` with detailed error information
- **Timing**: Sent immediately on callback failure
- **Content**: Timestamp, error message, full payload data

### Retry Mechanism

The system includes PayloadCMS initialization retry logic:

- **Max Retries**: 3 attempts
- **Retry Delay**: 1 second between attempts
- **Failure Handling**: Throws error after max retries exceeded

## Database Schema

### Payment Collection

Key fields for payment tracking:

```typescript
{
  user: Relationship,           // Customer who made payment
  order: Relationship,          // Associated order
  paymentMethod: string,        // Payment method used
  currency: string,             // Payment currency
  status: PaymentStatus,        // Current payment status
  paidAt: Date,                // Payment completion timestamp
  expireAt: Date,              // Payment expiration time
  paymentData: JSON,           // ZaloPay transaction data
  appTransId: string,          // ZaloPay transaction ID
}
```

### Payment Status Flow

```
pending → processing → paid
                   ↘ cancelled
                   ↘ failed
```

## Integration Points

### Order Management

Payment completion automatically triggers:

1. **Order Status Update**: Changes from 'pending' to 'completed'
2. **Ticket Generation**: Creates individual tickets for order items
3. **Inventory Updates**: Reduces available ticket quantities
4. **Customer Notifications**: Sends confirmation emails

### Seat Allocation

Post-payment processing includes:

1. **Seat Assignment**: Allocates specific seats within purchased zones
2. **Seat Holding Release**: Removes temporary seat holds
3. **Ticket Finalization**: Updates tickets with assigned seat numbers

## Testing & Development

### Local Testing

For local development with ZaloPay sandbox:

1. Use sandbox credentials in environment variables
2. Ensure callback URL is accessible (use ngrok for local testing)
3. Monitor callback logs for debugging

### Callback Testing

Test callback functionality using:

```bash
curl -X POST http://localhost:3000/api/zalopay/callback \
  -H "Content-Type: application/json" \
  -d '{"data":"test_data","mac":"test_mac"}'
```

## Security Considerations

### HMAC Verification

- All callbacks must pass HMAC-SHA256 verification
- Uses ZaloPay KEY2 for signature validation
- Prevents unauthorized callback requests

### Transaction Integrity

- Database transactions ensure atomic updates
- Rollback on any processing failure
- Prevents partial payment processing

### Error Information

- Sensitive payment data excluded from error logs
- Admin notifications contain full context for debugging
- Customer-facing errors are generic for security

## Monitoring & Maintenance

### Key Metrics

Monitor these payment callback metrics:

- **Success Rate**: Percentage of successful callbacks
- **Response Time**: Callback processing duration
- **Error Frequency**: Failed callback attempts
- **MAC Failures**: Invalid signature attempts

### Maintenance Tasks

Regular maintenance includes:

- **Log Cleanup**: Archive old payment logs
- **Error Review**: Analyze failed callback patterns
- **Performance Monitoring**: Track callback response times
- **Security Audits**: Review HMAC validation logs
