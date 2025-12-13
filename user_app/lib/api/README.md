# API Integration Documentation

## Overview

This project uses **Axios** for HTTP requests and **TanStack Query (React Query)** for state management and data fetching. The architecture follows industry best practices with proper separation of concerns.

## Structure

```
lib/
  api/
    axios.ts          # Axios instances and interceptors
    auth.api.ts       # Auth API endpoints
    index.ts          # API exports
hooks/
  useAuth.ts          # React Query hooks for auth
components/
  providers/
    query-provider.tsx  # QueryClient provider
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 2. Axios Instances

Two axios instances are configured:

#### `axiosInstance` (with interceptors)

- Used for protected routes
- Automatically adds authentication tokens
- Handles token refresh logic
- Use for: User data, bookings, payments, etc.

#### `axiosAuth` (without interceptors)

- Used for authentication endpoints
- No token injection
- Use for: Login, register, OTP verification

### 3. Interceptors

**Request Interceptor:**

```typescript
// Automatically adds Bearer token to requests (currently commented)
// Uncomment when token management is implemented
```

**Response Interceptor:**

```typescript
// Handles token refresh on 401 errors (currently commented)
// Implements retry logic for failed requests
```

## Usage Examples

### 1. Using React Query Hooks

```tsx
import { useLogin } from "@/hooks/useAuth";

function LoginComponent() {
	const loginMutation = useLogin();

	const handleLogin = async (data: LoginFormData) => {
		await loginMutation.mutateAsync(data, {
			onSuccess: (response) => {
				console.log("Success:", response);
			},
			onError: (error) => {
				console.error("Error:", error);
			},
		});
	};

	return (
		<button onClick={handleLogin} disabled={loginMutation.isPending}>
			{loginMutation.isPending ? "Loading..." : "Login"}
		</button>
	);
}
```

### 2. Creating New API Endpoints

**Step 1:** Create API client (e.g., `lib/api/booking.api.ts`)

```typescript
import axiosInstance from "./axios";
import type { BookingResponse } from "@/types/booking.type";

export const bookingApi = {
	getBookings: async () => {
		const response = await axiosInstance.get<BookingResponse[]>("/bookings");
		return response.data;
	},

	createBooking: async (data: BookingData) => {
		const response = await axiosInstance.post<BookingResponse>(
			"/bookings",
			data
		);
		return response.data;
	},
};
```

**Step 2:** Create React Query hook (e.g., `hooks/useBooking.ts`)

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api/booking.api";

export const useGetBookings = () => {
	return useQuery({
		queryKey: ["bookings"],
		queryFn: () => bookingApi.getBookings(),
	});
};

export const useCreateBooking = () => {
	return useMutation({
		mutationFn: (data: BookingData) => bookingApi.createBooking(data),
		onSuccess: () => {
			// Invalidate bookings query to refetch
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
		},
	});
};
```

**Step 3:** Export from index

```typescript
// lib/api/index.ts
export { bookingApi } from "./booking.api";
```

### 3. Error Handling

The implementation includes comprehensive error handling:

```typescript
try {
	await loginMutation.mutateAsync(data);
} catch (error: AxiosError<ErrorResponse>) {
	if (error.response?.data) {
		// Backend error response
		console.log(error.response.data.message);
	} else if (error.request) {
		// Network error
		console.log("Network error");
	} else {
		// Other errors
		console.log("Unexpected error");
	}
}
```

## Response Types

All API response types are defined in `types/*.type.ts`:

```typescript
// types/auth.type.ts
export interface LoginResponse {
	message: string;
}

export interface ErrorResponse {
	timestamp: string;
	status: number;
	message: string;
	error: string;
	errors?: Record<string, string>;
}
```

## Best Practices

### ✅ Do's

1. **Always validate data** with Zod before sending to API
2. **Use TypeScript types** for all requests and responses
3. **Handle errors** at component level for better UX
4. **Use React Query hooks** instead of direct axios calls
5. **Separate auth APIs** from protected APIs

### ❌ Don'ts

1. Don't use `axiosInstance` for auth endpoints (use `axiosAuth`)
2. Don't forget to add error boundaries
3. Don't expose sensitive data in error messages
4. Don't make direct axios calls in components

## Query Client Configuration

```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute
      refetchOnWindowFocus: false, // Disable auto-refetch
      retry: 1,                    // Retry once on failure
    },
    mutations: {
      retry: 1,                    // Retry mutations once
    },
  },
}
```

## Development Tools

- **React Query DevTools**: Available in development mode
- Press the floating icon in the bottom-right corner to open
- View active queries, mutations, and cache state

## Future Enhancements

When implementing authentication:

1. Uncomment token injection in request interceptor
2. Implement token refresh logic in response interceptor
3. Add token storage (localStorage/cookies)
4. Update `axiosInstance` configuration

Example:

```typescript
// Request interceptor
const token = localStorage.getItem("accessToken");
if (token) {
	config.headers.Authorization = `Bearer ${token}`;
}

// Response interceptor
if (error.response?.status === 401) {
	// Refresh token logic
	const newToken = await refreshAccessToken();
	// Retry original request
}
```

## Testing

```bash
# Run the development server
npm run dev

# Open React Query DevTools
# Click the flower icon in bottom-right corner
```

## Support

For issues or questions, refer to:

- [Axios Documentation](https://axios-http.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Next.js Documentation](https://nextjs.org/docs)
