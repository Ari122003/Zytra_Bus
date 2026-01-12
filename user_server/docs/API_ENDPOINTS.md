# API Endpoints Reference

## Authentication Endpoints

### User Authentication

| Method | Endpoint                | Description                 | Auth Required |
| ------ | ----------------------- | --------------------------- | ------------- |
| POST   | `/auth/user/login`      | User login (email/password) | No            |
| POST   | `/auth/user/verify-otp` | Verify OTP for new users    | No            |
| POST   | `/auth/user/refresh`    | Refresh user access token   | No            |
| POST   | `/auth/user/logout`     | Logout user                 | No            |

### Driver Authentication

| Method | Endpoint               | Description                   | Auth Required |
| ------ | ---------------------- | ----------------------------- | ------------- |
| POST   | `/auth/driver/login`   | Driver login (email/password) | No            |
| POST   | `/auth/driver/refresh` | Refresh driver access token   | No            |
| POST   | `/auth/driver/logout`  | Logout driver                 | No            |

---

## User App APIs (Require USER Role)

### User Management

| Method | Endpoint                            | Description             | Role Required |
| ------ | ----------------------------------- | ----------------------- | ------------- |
| GET    | `/user/users/{userId}/details`      | Get user details        | USER          |
| PUT    | `/user/users/{userId}/update-image` | Update user image       | USER          |
| PUT    | `/user/users/{userId}/update-info`  | Update user information | USER          |

### Bus Search

| Method | Endpoint                                                                  | Description            | Role Required |
| ------ | ------------------------------------------------------------------------- | ---------------------- | ------------- |
| GET    | `/user/buses/search?source={source}&destination={dest}&travelDate={date}` | Search available buses | USER          |

### Trip Management

| Method | Endpoint               | Description      | Role Required |
| ------ | ---------------------- | ---------------- | ------------- |
| GET    | `/user/trips/{tripId}` | Get trip details | USER          |

### Seat Management

| Method | Endpoint           | Description            | Role Required |
| ------ | ------------------ | ---------------------- | ------------- |
| POST   | `/user/seats/lock` | Lock seats for booking | USER          |

### Booking Management

| Method | Endpoint                            | Description               | Role Required |
| ------ | ----------------------------------- | ------------------------- | ------------- |
| POST   | `/user/booking/create`              | Create new booking        | USER          |
| GET    | `/user/booking/{userId}`            | Get all bookings for user | USER          |
| GET    | `/user/booking/details/{bookingId}` | Get booking details       | USER          |

---

## Driver App APIs (Require DRIVER Role)

### Driver Management

| Method | Endpoint                     | Description               | Role Required |
| ------ | ---------------------------- | ------------------------- | ------------- |
| GET    | `/driver/{driverId}/details` | Get driver details        | DRIVER        |
| PUT    | `/driver/{driverId}/update`  | Update driver information | DRIVER        |

---

## Request/Response Examples

### User Login

**Request:**

```json
POST /auth/user/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Existing User):**

```json
{
	"message": "Login successful",
	"status": "ACTIVE",
	"userId": 1,
	"accessToken": "eyJhbGciOiJIUzI1NiIs...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIs...",
	"expiresIn": 900
}
```

**Response (New User - OTP Sent):**

```json
{
	"message": "OTP sent successfully",
	"status": "PENDING_VERIFICATION"
}
```

### Driver Login

**Request:**

```json
POST /auth/driver/login
{
  "email": "driver@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
	"message": "Login successful",
	"status": "ACTIVE",
	"userId": 1,
	"accessToken": "eyJhbGciOiJIUzI1NiIs...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIs...",
	"expiresIn": 900
}
```

### Using Access Token

All protected endpoints require the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Error Responses

**Unauthorized (401):**

```json
Missing or invalid Authorization header
```

**Forbidden (403):**

```json
Access denied: User role required
```

or

```json
Access denied: Driver role required
```

---

## Token Structure

Access tokens contain the following claims:

- `sub` (subject): User/Driver email
- `userId`: User/Driver ID
- `role`: USER or DRIVER
- `status`: User/Driver status
- `exp`: Expiration timestamp
- `iat`: Issued at timestamp
- `iss`: Issuer (zytra-user-server)
- `aud`: Audience (zytra-api)

---

## Migration Notes for Frontend Apps

### User App Changes

1. Update login endpoint: `POST /auth/login` → `POST /auth/user/login`
2. Update verify OTP endpoint: `POST /auth/verify-otp` → `POST /auth/user/verify-otp`
3. Update refresh endpoint: `POST /auth/refresh` → `POST /auth/user/refresh`
4. Update logout endpoint: `POST /auth/logout` → `POST /auth/user/logout`
5. Add `/user` prefix to all API calls:
   - `/users/*` → `/user/users/*`
   - `/booking/*` → `/user/booking/*`
   - `/trips/*` → `/user/trips/*`
   - `/buses/*` → `/user/buses/*`
   - `/seats/*` → `/user/seats/*`

### Driver App Changes

1. Use driver login endpoint: `POST /auth/driver/login`
2. Use driver refresh endpoint: `POST /auth/driver/refresh`
3. Use driver logout endpoint: `POST /auth/driver/logout`
4. Use `/driver` prefix for driver-specific operations:
   - `/driver/{driverId}/details`
   - `/driver/{driverId}/update`

---

## Security Features

1. **Role-Based Access Control (RBAC)**

   - Users can only access `/user/*` endpoints
   - Drivers can only access `/driver/*` endpoints
   - Cross-role access is denied with 403 Forbidden

2. **JWT Token Authentication**

   - Stateless authentication using JWT
   - Role embedded in token
   - Token refresh with rotation
   - Automatic token expiration (15 minutes for access, 7 days for refresh)

3. **Path-Based Authorization**

   - AuthInterceptor validates role on every request
   - Role claim extracted from JWT
   - Request URI matched against role permissions

4. **Separate Authentication Flows**
   - Users: Login → OTP (if new) → Access Token
   - Drivers: Login → Access Token (direct password auth)
