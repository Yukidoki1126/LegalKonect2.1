# Forgot Password Setup with Resend

## What Has Been Implemented

### Backend (Laravel)
1. ✅ Installed Resend PHP package
2. ✅ Added forgot password endpoint (`POST /api/auth/forgot-password`)
3. ✅ Added reset password endpoint (`POST /api/auth/reset-password`)
4. ✅ Email sending with Resend integration
5. ✅ Password reset token generation and validation
6. ✅ Token expiry (60 minutes)

### Frontend (React)
1. ✅ "Forgot Password?" link in login page
2. ✅ Forgot password modal with email input
3. ✅ Reset password page (`/reset-password`)
4. ✅ Email validation and error handling
5. ✅ Success notifications

## Setup Instructions

### Step 1: Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the API key

### Step 2: Configure Backend

1. Open `backend/.env`
2. Add your Resend API key:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Update the email sender (if you have a verified domain):
   ```env
   MAIL_FROM_ADDRESS="noreply@yourdomain.com"
   MAIL_FROM_NAME="LegalKonect"
   ```

### Step 3: Update Frontend URL (if needed)

In `backend/.env`, update the frontend URL if different:
```env
FRONTEND_URL=http://localhost:5173
```

### Step 4: Update Email Sender in Controller

**Important:** Resend has restrictions for the free tier:
- You can only send emails FROM `onboarding@resend.dev`
- You can send TO any email address

To use your own domain:
1. Verify your domain in Resend dashboard
2. Update the 'from' address in `backend/app/Http/Controllers/Auth/AuthController.php`:
   ```php
   'from' => 'LegalKonect <noreply@yourdomain.com>',
   ```

## How It Works

### User Flow

1. **Request Reset:**
   - User clicks "Forgot Password?" on login page
   - Enters email address
   - System sends reset link via email

2. **Email Content:**
   - Contains reset link with token
   - Token expires in 60 minutes
   - Includes direct link and manual copy option

3. **Reset Password:**
   - User clicks link or pastes URL
   - Enters new password
   - Password is validated and updated
   - User is redirected to login

### Security Features

- ✅ Token is hashed before storage
- ✅ Token expires after 60 minutes
- ✅ Token is deleted after use
- ✅ Email must exist in database
- ✅ Password strength validation (min 8 characters)
- ✅ Password confirmation required

## Testing

### Test the flow:

1. Start backend:
   ```bash
   cd backend
   php artisan serve
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Test steps:
   - Go to login page
   - Click "Forgot Password?"
   - Enter a registered email
   - Check your email inbox
   - Click the reset link
   - Enter new password
   - Log in with new password

## Troubleshooting

### Email not sending?
- Check `RESEND_API_KEY` is set correctly
- For free tier, use `from: 'onboarding@resend.dev'`
- Check Resend dashboard for error logs

### Token invalid/expired?
- Tokens expire after 60 minutes
- Request a new reset link
- Check system time is correct

### Link not working?
- Verify `FRONTEND_URL` in backend `.env`
- Check frontend is running on correct port
- Ensure URL format: `http://localhost:5173/reset-password?token=xxx&email=xxx`

## API Endpoints

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "xxxxxxxxxx",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

## Customization

### Email Template

Edit the email HTML in `backend/app/Http/Controllers/Auth/AuthController.php` in the `forgotPassword` method:

```php
'html' => "
    <!-- Your custom HTML email template -->
"
```

### Token Expiry Time

Change the 60-minute expiry in `resetPassword` method:

```php
if (now()->diffInMinutes($resetRecord->created_at) > 60) {
    // Change 60 to your desired minutes
}
```

## Production Considerations

1. **Verify Domain:** Add and verify your domain in Resend
2. **Environment Variables:** Set production `FRONTEND_URL`
3. **HTTPS:** Ensure reset links use HTTPS in production
4. **Rate Limiting:** Consider adding rate limiting to prevent abuse
5. **Email Template:** Design a professional email template
6. **Monitoring:** Monitor Resend dashboard for deliverability

## Support

For issues with:
- **Resend:** Check [Resend Documentation](https://resend.com/docs)
- **Backend:** Check Laravel logs in `backend/storage/logs/`
- **Frontend:** Check browser console for errors
