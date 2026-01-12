# Driver App Authentication System

This driver app has been configured with a complete authentication system matching the user app's design and functionality.

## 🎨 Features Implemented

### Authentication Pages

- **Login Page** (`/login`) - Email and password authentication
- **Registration Page** (`/register`) - Driver registration with name, email, phone, password, and confirm password
- **Protected Trips Page** (`/trips`) - Shows upcoming and ongoing trips (only accessible when authenticated)

### Authentication System Components

1. **Type Definitions** (`types/auth.type.ts`)

   - Driver status types
   - Login/Register request/response interfaces
   - Error handling types
   - Auth state management types

2. **Validation Schemas** (`lib/zod/auth.schema.ts`)

   - Zod schemas for form validation
   - Password requirements: min 8 chars, uppercase, lowercase, number, special character
   - Phone validation: exactly 10 digits
   - Email validation

3. **Token Management** (`lib/token.ts`)

   - Secure localStorage management
   - JWT token handling (access & refresh tokens)
   - Token expiration checking
   - Driver data persistence

4. **API Client** (`lib/api/client.ts`)

   - Axios instance with interceptors
   - Automatic token refresh on 401 errors
   - Request queuing during token refresh
   - Authorization header management

5. **Auth API Service** (`lib/api/auth.api.ts`)

   - Login endpoint
   - Register endpoint
   - Refresh token endpoint
   - Logout endpoint

6. **Auth Context** (`contexts/AuthContext.tsx`)

   - Global authentication state management
   - Login/Register/Logout methods
   - Auto token refresh
   - Persistent authentication across page reloads

7. **Protected Route Component** (`components/auth/ProtectedRoute.tsx`)

   - Guards protected pages
   - Redirects to login if not authenticated
   - Shows loading state during auth check

8. **UI Components**
   - Button component with variants (default, outline, destructive, etc.)
   - Consistent styling with user app

## 🔐 Authentication Flow

### Registration Flow

1. Driver fills registration form (name, email, phone, password, confirm password)
2. Form validation with Zod schema
3. API call to `/auth/register`
4. Tokens stored in localStorage
5. Driver redirected to `/trips` page

### Login Flow

1. Driver enters email and password
2. Form validation
3. API call to `/auth/login`
4. Tokens stored in localStorage
5. Driver redirected to `/trips` page

### Protected Routes

1. ProtectedRoute component checks authentication status
2. If not authenticated → redirect to `/login`
3. If authenticated → render protected content
4. Loading state shown during auth check

### Token Refresh

1. Access token expires
2. API interceptor catches 401 error
3. Automatically calls refresh endpoint
4. Updates tokens in localStorage
5. Retries failed request with new token
6. Queues additional requests during refresh

## 📁 File Structure

```
driver_app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   ├── (protected)/
│   │   └── trips/
│   │       └── page.tsx          # Protected trips home page
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Home page (redirects)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # Protected route wrapper
│   └── ui/
│       └── button.tsx            # Button component
├── contexts/
│   └── AuthContext.tsx           # Auth context provider
├── hooks/
│   ├── index.ts
│   └── useAuth.ts                # Auth hook
├── lib/
│   ├── api/
│   │   ├── auth.api.ts           # Auth API calls
│   │   └── client.ts             # Axios client
│   ├── zod/
│   │   ├── auth.schema.ts        # Validation schemas
│   │   └── index.ts
│   ├── token.ts                  # Token management
│   └── utils.ts                  # Utility functions
└── types/
    └── auth.type.ts              # TypeScript types
```

## 🚀 Usage

### Start the development server

```bash
cd driver_app
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_DRIVER_API_URL=http://localhost:8080/driver
```

## 🎨 Styling

The driver app uses the same styling system as the user app:

- Tailwind CSS for styling
- Dark mode support
- Consistent color scheme with primary, secondary, muted colors
- Same UI components (Button, etc.)
- Responsive design (mobile-first)

## 📝 Form Validation

### Login Form

- Email: Valid email format required
- Password: Must meet complexity requirements

### Registration Form

- Name: Required field
- Email: Valid email format
- Phone: Exactly 10 digits
- Password: Min 8 chars, uppercase, lowercase, number, special character
- Confirm Password: Must match password

## 🔒 Security Features

1. **JWT Authentication**

   - Access tokens for API requests
   - Refresh tokens for token renewal
   - Tokens stored in localStorage (client-side only)

2. **Password Requirements**

   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

3. **Token Refresh**

   - Automatic refresh before expiration
   - Request queuing during refresh
   - Fallback to login on refresh failure

4. **Protected Routes**
   - Client-side route protection
   - Redirect to login for unauthenticated users
   - Session persistence across page reloads

## 📱 Trips Page Features

The protected trips page displays:

- **Ongoing Trips**: Currently active trips with real-time location
- **Upcoming Trips**: Scheduled future trips
- Trip details: route, bus number, departure time, passenger count
- Driver profile in header
- Logout functionality

## 🎯 Next Steps

To complete the driver app, you may want to:

1. Create backend API endpoints for driver authentication
2. Implement actual trip data fetching from API
3. Add trip details pages
4. Implement real-time trip tracking
5. Add driver profile management
6. Implement push notifications for trip updates
