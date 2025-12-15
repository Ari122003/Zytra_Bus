# Authentication System Documentation

## Overview

This is a secure, industry-standard client-side authentication system for the Zytra Bus Next.js application. It implements JWT-based authentication with automatic token refresh, protected routes, and comprehensive error handling.

## Architecture

### Core Components

1. **AuthContext** (`contexts/AuthContext.tsx`)

   - Centralized authentication state management
   - Provides auth methods: `login`, `verifyOtp`, `logout`, `refreshAuth`
   - Automatic token refresh every minute
   - Persists authentication state across page reloads

2. **API Service** (`lib/api.ts`)

   - Axios instance with automatic request/response interceptors
   - Adds Bearer token to all authenticated requests
   - Automatic token refresh on 401 responses
   - Request queue management during token refresh

3. **Token Manager** (`lib/token.ts`)

   - Secure token storage in localStorage
   - Token expiration checking
   - JWT decoding utilities
   - Automatic cleanup on logout

4. **ProtectedRoute Component** (`components/auth/ProtectedRoute.tsx`)
   - HOC for protecting routes requiring authentication
   - Automatic redirect to login for unauthenticated users
   - Loading state management
   - Stores intended destination for post-login redirect

## Authentication Flow

### New User Registration

```
1. User enters email + password on /login
   ↓
2. System calls POST /auth/login
   ↓
3. Backend returns status: "PENDING_VERIFICATION"
   ↓
4. User redirected to /verify
   ↓
5. User enters: name, phone, DOB
   ↓
6. User receives OTP via email (5 min expiry)
   ↓
7. User enters 6-digit OTP
   ↓
8. System calls POST /auth/verify-otp
   ↓
9. Backend returns tokens (accessToken, refreshToken)
   ↓
10. Tokens stored, user redirected to home
```

### Existing User Login

```
1. User enters email + password on /login
   ↓
2. System calls POST /auth/login
   ↓
3. Backend returns status: "ACTIVE" + tokens
   ↓
4. Tokens stored in localStorage
   ↓
5. User redirected to home or intended destination
```

### Token Refresh Flow

```
1. Access token expires (15 minutes)
   ↓
2. Next API call receives 401 Unauthorized
   ↓
3. Interceptor catches 401
   ↓
4. System calls POST /auth/refresh with refreshToken
   ↓
5. Backend returns new tokens
   ↓
6. Old tokens replaced with new ones
   ↓
7. Original request retried with new token
   ↓
8. If refresh fails → clear auth → redirect to login
```

### Logout Flow

```
1. User clicks logout
   ↓
2. System calls POST /auth/logout with refreshToken
   ↓
3. Backend revokes refresh token
   ↓
4. Client clears all stored tokens
   ↓
5. User redirected to /login
```

## Security Features

### 1. **Token Security**

- Access tokens stored in localStorage (short-lived, 15 min)
- Refresh tokens stored in localStorage (long-lived)
- Tokens cleared on logout or auth failure
- JWT signature validation by backend

### 2. **Automatic Token Refresh**

- Proactive refresh before expiration (2 min buffer)
- Background refresh check every 60 seconds
- Seamless user experience without interruption

### 3. **Request Queue Management**

- Multiple simultaneous API calls during token refresh
- Failed requests queued and retried after refresh
- Prevents duplicate refresh requests

### 4. **Protected Routes**

- Server-side route protection via layout
- Client-side protection via ProtectedRoute component
- Automatic redirect with return URL preservation

### 5. **Input Validation**

- Zod schema validation for all forms
- Password requirements enforced:
  - Min 8 characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 digit
  - 1 special character
- Email format validation
- Phone number validation (10 digits)
- Age verification (18+ years)

### 6. **Error Handling**

- Network error detection
- Field-specific error display
- User-friendly error messages
- Automatic retry on transient failures

## File Structure

```
lib/
├── api.ts                 # Axios client with interceptors
├── token.ts               # Token management utilities
└── zod/
    ├── auth.schema.ts     # Validation schemas
    └── index.ts           # Schema exports

contexts/
└── AuthContext.tsx        # Auth state & methods

components/
└── auth/
    └── ProtectedRoute.tsx # Route protection HOC

types/
└── auth.type.ts           # TypeScript interfaces

hooks/
└── useAuth.ts             # Auth hook export

app/
├── layout.tsx             # Root layout with AuthProvider
├── (auth)/
│   ├── login/
│   │   └── page.tsx       # Login/registration page
│   └── verify/
│       └── page.tsx       # OTP verification page
└── (protected)/
    └── layout.tsx         # Protected routes layout
```

## Usage Examples

### Using Authentication in Components

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
	const { user, isAuthenticated, logout } = useAuth();

	if (!isAuthenticated) {
		return <div>Please log in</div>;
	}

	return (
		<div>
			<p>Welcome, {user?.name || user?.email}</p>
			<button onClick={logout}>Logout</button>
		</div>
	);
}
```

### Creating Protected Pages

```tsx
// app/(protected)/dashboard/page.tsx
export default function DashboardPage() {
	// Already protected by (protected) layout
	return <div>Protected content</div>;
}
```

### Making Authenticated API Calls

```tsx
import apiClient from "@/lib/api";

// Token automatically added to headers
const response = await apiClient.get("/api/bookings");
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## API Endpoints Used

| Endpoint           | Method | Description                        |
| ------------------ | ------ | ---------------------------------- |
| `/auth/login`      | POST   | Login/initiate registration        |
| `/auth/verify-otp` | POST   | Verify OTP & complete registration |
| `/auth/refresh`    | POST   | Refresh access token               |
| `/auth/logout`     | POST   | Logout & revoke tokens             |

## Best Practices Implemented

1. ✅ **Separation of Concerns**: Auth logic separated into contexts, utilities, and components
2. ✅ **Type Safety**: Full TypeScript coverage with strict types
3. ✅ **Validation**: Client-side validation with Zod schemas
4. ✅ **Error Handling**: Comprehensive error handling with user feedback
5. ✅ **Token Rotation**: Automatic refresh token rotation
6. ✅ **Loading States**: Proper loading indicators during async operations
7. ✅ **Accessibility**: Semantic HTML and ARIA labels
8. ✅ **Security**: No sensitive data in URLs, secure storage practices
9. ✅ **UX**: Smooth redirects, preserved navigation state
10. ✅ **Performance**: Optimistic updates, request deduplication

## Testing Checklist

- [ ] New user registration flow
- [ ] Existing user login flow
- [ ] OTP verification with valid code
- [ ] OTP verification with invalid/expired code
- [ ] Token refresh on expiration
- [ ] Logout functionality
- [ ] Protected route access without auth
- [ ] Protected route access with auth
- [ ] Session persistence across page reloads
- [ ] Network error handling
- [ ] Form validation errors
- [ ] Password visibility toggle
- [ ] OTP resend functionality

## Troubleshooting

### Issue: User logged out unexpectedly

**Solution**: Check if refresh token expired or backend revoked it

### Issue: Infinite redirect loop

**Solution**: Verify protected routes don't include auth pages

### Issue: Token not being sent

**Solution**: Check API base URL and interceptor configuration

### Issue: OTP not received

**Solution**: Verify email in sessionStorage and backend email service

## Future Enhancements

1. **Social Login**: Add OAuth providers (Google, Facebook)
2. **Remember Me**: Optional persistent login
3. **2FA**: Two-factor authentication
4. **Password Reset**: Forgot password flow
5. **Session Management**: View and revoke active sessions
6. **Biometric Auth**: Fingerprint/Face ID support
7. **Rate Limiting**: Client-side request throttling
8. **Analytics**: Track auth events
9. **Offline Support**: Handle offline state gracefully
10. **Security Headers**: Add CSP, HSTS headers

## Support

For issues or questions, contact the development team or create an issue in the repository.
