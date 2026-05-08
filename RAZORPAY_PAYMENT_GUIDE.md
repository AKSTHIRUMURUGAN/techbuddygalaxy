# Razorpay Payment Integration Guide

## Overview

The quotation system now supports online payments through Razorpay, along with offline payment methods (UPI, Cash, Bank Transfer).

## Features

✅ **Online Payment via Razorpay** - Credit/Debit Cards, UPI, Net Banking, Wallets  
✅ **Offline Payment Methods** - UPI Transfer, Cash, Bank Transfer  
✅ **Payment Verification** - Automatic signature verification for Razorpay payments  
✅ **Payment Status Tracking** - Real-time payment status updates  
✅ **Paid Badge** - Visual indicator when quotation is paid  

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys
3. Generate Test/Live API Keys
4. Copy the Key ID and Key Secret

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App URL (required for payment callbacks)
NEXT_PUBLIC_APP_URL=https://galaxy.techbuddyspace.in
```

### 3. Install Razorpay Package

```bash
npm install razorpay
```

## How It Works

### For Admin (Creating Quotation)

1. **Create Quotation** - Fill in client and project details
2. **Enable Online Payment** - Check the "Enable Online Payment" checkbox
3. **Set Payment Options** - Razorpay will be enabled for this quotation
4. **Send to Client** - Client receives quotation with "Pay Now" button

### For Client (Paying Quotation)

1. **Open Quotation Link** - Client clicks the quotation URL
2. **Click "Pay Now"** - Opens payment modal
3. **Choose Payment Method**:
   - **Online Payment** (if enabled) - Opens Razorpay checkout
   - **UPI Transfer** - Manual verification required
   - **Cash** - Manual verification required
4. **Complete Payment** - Status updates to "Paid"

## Payment Flow

### Online Payment (Razorpay)

```
Client clicks "Pay Now"
    ↓
Select "Online Payment"
    ↓
API creates Razorpay order
    ↓
Razorpay checkout opens
    ↓
Client completes payment
    ↓
Payment verified via signature
    ↓
Quotation status → "Paid"
```

### Offline Payment

```
Client clicks "Pay Now"
    ↓
Select "UPI/Cash"
    ↓
Confirm payment
    ↓
Admin verifies manually
    ↓
Quotation status → "Paid"
```

## API Endpoints

### Create Razorpay Order
```
POST /api/quotations/[id]/create-order
```
Creates a Razorpay order for the quotation amount.

### Verify Payment
```
POST /api/quotations/[id]/verify-payment
Body: {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  paymentMethod
}
```
Verifies Razorpay payment signature and updates quotation.

### Mark as Paid (Offline)
```
POST /api/quotations/[id]/mark-paid
Body: {
  paymentMethod: 'upi' | 'cash' | 'bank_transfer',
  paymentNotes: string,
  paidAmount: number
}
```
Marks quotation as paid for offline payments.

## Database Schema Updates

### Quotation Model - New Fields

```javascript
{
  // Payment fields
  paymentMethod: {
    type: String,
    enum: ['online', 'upi', 'cash', 'bank_transfer'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayEnabled: {
    type: Boolean,
    default: false,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paidAmount: {
    type: Number,
    default: 0,
  },
  paidAt: Date,
  paymentNotes: String,
  
  // Updated status enum
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'paid'],
    default: 'draft',
  },
}
```

## Testing

### Test Mode (Razorpay)

Use Razorpay test credentials:
- Key ID: `rzp_test_xxxxxxxxxxxxx`
- Key Secret: `your_test_secret`

### Test Cards

```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

### Test UPI

```
UPI ID: success@razorpay
```

## Security

✅ **Signature Verification** - All Razorpay payments are verified using HMAC SHA256  
✅ **Server-Side Validation** - Payment verification happens on the server  
✅ **Secure Credentials** - API keys stored in environment variables  
✅ **HTTPS Required** - All payment transactions over HTTPS  

## Payment Status Flow

```
pending → processing → completed
                    ↓
                  failed
```

- **pending**: Initial state, no payment attempted
- **processing**: Razorpay order created, awaiting payment
- **completed**: Payment successful and verified
- **failed**: Payment attempt failed
- **refunded**: Payment refunded (manual process)

## Troubleshooting

### Payment Not Working

1. **Check Razorpay Credentials**
   ```bash
   echo $RAZORPAY_KEY_ID
   echo $RAZORPAY_KEY_SECRET
   ```

2. **Verify Razorpay is Enabled**
   - Check `razorpayEnabled` field in quotation
   - Ensure checkbox was checked during creation

3. **Check Browser Console**
   - Look for Razorpay script loading errors
   - Check for CORS issues

4. **Verify Webhook URL** (if using webhooks)
   - Razorpay Dashboard → Webhooks
   - Add your webhook URL

### Signature Verification Failed

- Ensure `RAZORPAY_KEY_SECRET` is correct
- Check that order_id and payment_id match
- Verify signature generation algorithm

### Payment Completed but Status Not Updated

- Check server logs for errors
- Verify database connection
- Ensure quotation ID is correct

## Going Live

### Checklist

- [ ] Replace test keys with live keys
- [ ] Test with real payment methods
- [ ] Set up Razorpay webhooks (optional)
- [ ] Configure payment notifications
- [ ] Test refund process
- [ ] Update terms and conditions
- [ ] Enable 2FA on Razorpay account

### Live Credentials

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
```

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Support**: https://razorpay.com/support/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/

---

**Last Updated:** May 8, 2026  
**Version:** 1.0.0
