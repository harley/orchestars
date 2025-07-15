# Ticket Gift System - Quick Guide

## How to Gift Tickets (Admin)

### Step 1: Access the Gift System
1. Log into PayloadCMS admin panel
2. Navigate to `/admin/create-ticket-gift`
3. You'll see the "Gift Tickets to Another User" form

### Step 2: Select Ticket Owner
1. **Search by email**: Type the ticket owner's email in the search field
2. **Select owner**: Choose from the dropdown suggestions
3. **Auto-load tickets**: System automatically loads all giftable tickets for that owner

**Note**: Only tickets with status "booked" and not previously gifted will appear.

### Step 3: Choose Tickets to Gift
1. **View available tickets**: See ticket code, seat, event name, and date
2. **Search tickets**: Use the quick search to find specific tickets by code or seat
3. **Select tickets**: Check the boxes for tickets you want to gift
4. **Multiple selection**: You can gift multiple tickets at once

### Step 4: Enter Recipient Information
Fill out the recipient details:
- **First Name** ✅ Required
- **Last Name** ✅ Required  
- **Email** ✅ Required (must be valid email format)
- **Phone** ⚪ Optional

### Step 5: Send the Gift
1. Click "Send Gift" button
2. System processes the transfer
3. Success message appears with details
4. Recipient receives email notification

## What Happens After Gifting?

### For Existing Users
- Tickets are immediately transferred to their account
- They receive a gift notification email
- They can access tickets through their existing login

### For New Users
- New account is automatically created
- Password setup email is sent (expires in 1 hour)
- They must set up password to access their tickets
- Welcome email includes all ticket details

## Email Notifications

Recipients receive an email containing:
- **Ticket Details**: Code, seat, event name, date, location
- **Gift Information**: Who gifted the tickets
- **Account Setup**: Password setup link (new users only)
- **Event Guidelines**: Check-in instructions and policies
- **Bilingual Content**: Vietnamese and English

## Troubleshooting

### No Tickets Showing for Owner
**Possible Causes:**
- Owner has no "booked" tickets
- All tickets already gifted
- Tickets are cancelled or pending payment

**Solution:** Verify ticket status in the tickets collection

### Gift Creation Fails
**Common Issues:**
- Invalid email format
- Missing required fields
- Database connection issues
- Already gifted tickets selected

**Solution:** Check form validation messages and try again

### Email Not Received
**Check:**
- Spam/junk folder
- Email address spelling
- Email server configuration
- Email logs in admin panel

### Account Setup Issues
**For New Users:**
- Setup link expires in 1 hour
- Check email for setup instructions
- Contact admin if link expired

## Important Rules

### Ticket Eligibility
✅ **Can be gifted:**
- Status: "booked" (paid and confirmed)
- Not previously gifted
- Owned by selected user

❌ **Cannot be gifted:**
- Cancelled tickets
- Pending payment tickets
- Already gifted tickets
- Tickets owned by different user

### User Account Rules
- One email = one account
- Existing users: tickets added to current account
- New users: account created automatically
- Password setup required for new accounts

### Transfer Rules
- Transfers are immediate and permanent
- Original owner loses access to gifted tickets
- Recipient becomes new owner
- Gift date and details are recorded

## Quick Reference

| Action | Location | Access Level |
|--------|----------|--------------|
| Gift Tickets | `/admin/create-ticket-gift` | Admin Only |
| View Tickets | `/admin/collections/tickets` | Admin Only |
| Check Users | `/admin/collections/users` | Admin Only |

| Status | Meaning | Can Gift? |
|--------|---------|-----------|
| booked | Paid & Confirmed | ✅ Yes |
| pending_payment | Awaiting Payment | ❌ No |
| cancelled | Cancelled | ❌ No |
| hold | Temporarily Held | ❌ No |

## Best Practices

### Before Gifting
1. **Verify ownership**: Ensure selected user actually owns the tickets
2. **Check ticket status**: Only gift "booked" tickets
3. **Confirm recipient details**: Double-check email address
4. **Communicate with parties**: Inform both owner and recipient

### After Gifting
1. **Confirm email delivery**: Check that recipient received notification
2. **Follow up with new users**: Ensure they can set up their account
3. **Document the transfer**: Keep records for support purposes
4. **Monitor for issues**: Be available for troubleshooting

### Security Tips
- Only gift to trusted recipients
- Verify email addresses carefully
- Keep records of all transfers
- Monitor for suspicious activity

## Support Information

### For Technical Issues
1. Check browser console for errors
2. Verify admin permissions
3. Review database logs
4. Test email configuration

### For User Support
1. Help with password setup
2. Resend notification emails
3. Verify ticket transfers
4. Resolve account access issues

### Contact Information
- **Technical Support**: Check system logs and database
- **User Support**: Help with account and email issues
- **Admin Support**: Assist with gift creation process

---

**Need more detailed information?** See the full [Ticket Gift System Documentation](ticket-gift-system.md) for technical details, API reference, and advanced troubleshooting.
