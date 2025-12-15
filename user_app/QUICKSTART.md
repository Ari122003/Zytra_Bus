# Authentication System - Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies

All required dependencies are already in your `package.json`. If needed, run:

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📋 Testing the Authentication Flow

### Test Scenario 1: New User Registration

1. **Navigate to Login Page**

   - Go to `http://localhost:3000/login`

2. **Enter Credentials**

   - Email: `newuser@example.com`
   - Password: `Password@123`
   - Click "Continue"

3. **Complete Profile** (After OTP is sent)

   - Enter your full name
   - Enter phone number (10 digits)
   - Enter date of birth (must be 18+)
   - Click "Continue to OTP"

4. **Verify OTP**

   - Enter the 6-digit OTP sent to your email
   - Click "Verify & Complete Registration"

5. **Success!**
   - You'll be redirected to the home page
   - Navbar will show your name/email
   - All protected routes are now accessible

### Test Scenario 2: Existing User Login

1. **Navigate to Login Page**

   - Go to `http://localhost:3000/login`

2. **Enter Credentials**

   - Email: `existinguser@example.com`
   - Password: `Password@123`
   - Click "Continue"

3. **Success!**
   - Immediately redirected to home page (no OTP needed)
   - Authentication state persists across page refreshes

### Test Scenario 3: Protected Routes

1. **Without Authentication**

   - Try accessing `http://localhost:3000/account`
   - You'll be redirected to `/login`
   - After login, you'll return to the intended page

2. **With Authentication**
   - Login first
   - Navigate to any route under `(protected)`
   - Access granted with no redirects

### Test Scenario 4: Token Refresh

1. **Login and wait 13+ minutes**

   - Make any API call
   - Token will auto-refresh in background
   - No interruption to user experience

2. **Verify in DevTools**
   - Open Network tab
   - Watch for automatic `/auth/refresh` calls
   - New tokens stored automatically

### Test Scenario 5: Logout

1. **Click Logout**

   - In navbar, click "Logout" button
   - Redirected to `/login`
   - All tokens cleared from storage

2. **Verify**
   - Try accessing protected routes
   - Should redirect to login

## 🔍 Debug Mode

### View Authentication State

Add this to any component:

```tsx
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function DebugAuth() {
	const auth = useAuth();

	return (
		<pre className="p-4 bg-gray-100 rounded">
			{JSON.stringify(auth, null, 2)}
		</pre>
	);
}
```

### View Tokens

Open browser DevTools → Application → Local Storage → `http://localhost:3000`

You'll see:

- `auth_access_token`
- `auth_refresh_token`
- `auth_user`

### View Network Requests

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Watch for:
   - `/auth/login` - Login requests
   - `/auth/verify-otp` - OTP verification
   - `/auth/refresh` - Token refresh
   - `/auth/logout` - Logout requests

## 🎯 Routes Overview

### Public Routes (No Auth Required)

- `/` - Home page (visible to all)
- `/login` - Login/Registration page
- `/verify` - OTP verification page

### Protected Routes (Auth Required)

All routes under `app/(protected)/`:

- `/account` - User account page
- `/bookings` - User bookings list
- `/bookings/[bookingId]` - Booking details
- `/results` - Search results

## ⚙️ Key Files Reference

### Authentication Logic

- `contexts/AuthContext.tsx` - Auth state & methods
- `lib/api.ts` - API client with interceptors
- `lib/token.ts` - Token management
- `components/auth/ProtectedRoute.tsx` - Route guard

### Forms & Validation

- `lib/zod/auth.schema.ts` - Form validation schemas
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/verify/page.tsx` - OTP verification page

### Types

- `types/auth.type.ts` - TypeScript interfaces

## 🐛 Common Issues & Solutions

### Issue: "Network error" on login

**Cause**: Backend not running or wrong API URL
**Solution**:

1. Verify backend is running on port 8080
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Issue: OTP not being sent

**Cause**: Backend email service not configured
**Solution**: Check backend logs for email service errors

### Issue: Token refresh fails

**Cause**: Refresh token expired or revoked
**Solution**: Normal behavior - user will be redirected to login

### Issue: Redirected to login after page refresh

**Cause**: Tokens not persisting in localStorage
**Solution**:

1. Check browser allows localStorage
2. Verify no Private/Incognito mode
3. Check browser console for errors

### Issue: "User must be 18 years old" error

**Cause**: DOB indicates user under 18
**Solution**: Use DOB that makes user 18+

### Issue: Password validation fails

**Cause**: Password doesn't meet requirements
**Solution**: Ensure password has:

- Min 8 characters
- 1 uppercase (A-Z)
- 1 lowercase (a-z)
- 1 digit (0-9)
- 1 special char (!@#$%^&\*(),.?":{}|<>)

## 📊 Password Requirements

Valid password examples:

- `Password@123`
- `SecurePass1!`
- `MyStr0ng#Pass`

Invalid passwords:

- `password123` (no uppercase, no special char)
- `PASSWORD123` (no lowercase, no special char)
- `Password` (too short, no digit, no special char)
- `Pass@12` (too short)

## 🔐 Security Checklist

- [x] Passwords encrypted by backend
- [x] JWT tokens with expiration
- [x] Automatic token refresh
- [x] Token rotation on refresh
- [x] Secure token storage
- [x] HTTPS recommended for production
- [x] Input validation (client & server)
- [x] XSS protection via React
- [x] CSRF protection via token-based auth
- [x] No sensitive data in URLs

## 📱 Mobile Testing

1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select mobile device
4. Test responsive design:
   - Login form adapts to mobile
   - OTP inputs work with numeric keyboard
   - Navbar transforms to mobile menu
   - Protected routes work same as desktop

## 🎨 Customization

### Change Token Expiration Check Interval

In `contexts/AuthContext.tsx`, line ~245:

```tsx
}, 60000); // Check every 60 seconds (60000ms)
```

### Change Token Refresh Buffer

In `contexts/AuthContext.tsx`, line ~240:

```tsx
if (accessToken && tokenManager.willExpireSoon(accessToken, 120)) {
	// 120 seconds = 2 minutes before expiry
}
```

### Change Loading Indicator

In `components/auth/ProtectedRoute.tsx`:

```tsx
// Customize the loading fallback UI
```

## 📞 Support

For issues or questions:

1. Check this guide first
2. Review [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed docs
3. Check browser console for errors
4. Verify backend API is responding correctly
5. Contact development team

---

**Last Updated**: December 14, 2025
**Version**: 1.0.0
