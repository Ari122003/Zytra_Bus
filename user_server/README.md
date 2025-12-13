# Zytra Bus - User Authentication Server

A robust Spring Boot authentication service featuring JWT-based authentication, OTP verification, and refresh token management for the Zytra Bus application.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 📧 **Email OTP Verification** - Email verification for new user registration
- 🔄 **Refresh Token Management** - Token rotation with automatic expiry
- 🔒 **Password Encryption** - Secure password storage
- ⚡ **Spring Boot 4.0** - Latest Spring Boot framework
- 🗄️ **PostgreSQL Database** - Reliable data persistence
- ✅ **Input Validation** - Comprehensive request validation

## 🛠️ Tech Stack

- **Java 21**
- **Spring Boot 4.0.0**
- **Spring Data JPA**
- **PostgreSQL**
- **JWT (JSON Web Tokens)**
- **Lombok**
- **Maven**

## 📦 Prerequisites

- Java 21 or higher
- Maven 3.6+
- PostgreSQL database
- SMTP server (Gmail configured by default)

## 🚀 Installation

1. **Configure application properties**

   Update `src/main/resources/application.properties` with your settings:

   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:postgresql://your-host:5432/your-database
   spring.datasource.username=your-username
   spring.datasource.password=your-password

   # Email Configuration
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password

   # JWT Configuration
   jwt.secret=your-secure-secret-key-at-least-32-characters
   jwt.access.token.expiration-minutes=15
   jwt.refresh.token.expiration-days=90
   ```

2. **Build the project**

   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

The server will start on `http://localhost:8080`

## ⚙️ Configuration

### JWT Settings

- **Access Token Expiry**: 15 minutes (configurable)
- **Refresh Token Expiry**: 90 days (configurable)
- **Algorithm**: HS256

### Email Settings

- **Provider**: Gmail SMTP
- **Port**: 587
- **TLS**: Enabled

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character (@#$%^&+=)

---

## 📚 API Documentation

Base URL: `http://localhost:8080`

### 1. Login API

Authenticates existing users or initiates registration for new users via OTP.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "Password@123"
}
```

**Request Fields:**

| Field    | Type   | Required | Validation                                                     |
| -------- | ------ | -------- | -------------------------------------------------------------- |
| email    | String | Yes      | Valid email format                                             |
| password | String | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |

**Response (Existing Active User):**

```json
{
	"message": "Login successful",
	"status": "ACTIVE",
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"expiresIn": 900
}
```

**Response (New User - OTP Sent):**

```json
{
	"message": "OTP sent successfully",
	"status": "PENDING_VERIFICATION",
	"accessToken": null,
	"refreshToken": null,
	"expiresIn": null
}
```

**Success Codes:**

- `200 OK` - Login successful or OTP sent

**Error Responses:**

- `400 Bad Request` - Invalid email or password format
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - User blocked or deleted

---

### 2. Verify OTP API

Verifies OTP and completes user registration for new users.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**

```json
{
	"name": "John Doe",
	"dob": "1990-05-15",
	"phone": "9876543210",
	"email": "user@example.com",
	"password": "Password@123",
	"otp": "123456"
}
```

**Request Fields:**

| Field    | Type   | Required | Validation                        |
| -------- | ------ | -------- | --------------------------------- |
| name     | String | Yes      | Cannot be blank                   |
| dob      | String | Yes      | Format: YYYY-MM-DD                |
| phone    | String | Yes      | Exactly 10 digits                 |
| email    | String | Yes      | Valid email format                |
| password | String | Yes      | Password requirements (see above) |
| otp      | String | Yes      | Exactly 6 digits                  |

**Response (Success):**

```json
{
	"message": "Login successful",
	"status": "ACTIVE",
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"expiresIn": 900
}
```

**Success Codes:**

- `200 OK` - OTP verified, user registered and logged in

**Error Responses:**

- `400 Bad Request` - Invalid OTP format or missing fields
- `401 Unauthorized` - Invalid or expired OTP
- `409 Conflict` - User already exists

---

### 3. Refresh Token API

Generates new access and refresh tokens using a valid refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**

```json
{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Fields:**

| Field        | Type   | Required | Validation              |
| ------------ | ------ | -------- | ----------------------- |
| refreshToken | String | Yes      | Valid JWT refresh token |

**Response (Success):**

```json
{
	"message": "Token refreshed successfully",
	"status": "ACTIVE",
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"expiresIn": 900
}
```

**Success Codes:**

- `200 OK` - Tokens refreshed successfully

**Error Responses:**

- `400 Bad Request` - Refresh token is required
- `401 Unauthorized` - Invalid, expired, or revoked refresh token
- `404 Not Found` - User not found

**Notes:**

- Old refresh token is automatically revoked (token rotation)
- User receives both new access token and new refresh token

---

### 4. Logout API

Revokes the refresh token and logs out the user.

**Endpoint:** `POST /auth/logout`

**Request Body:**

```json
{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Fields:**

| Field        | Type   | Required | Validation              |
| ------------ | ------ | -------- | ----------------------- |
| refreshToken | String | Yes      | Valid JWT refresh token |

**Response (Success):**

```json
{
	"message": "Logout successful"
}
```

**Success Codes:**

- `200 OK` - Logout successful

**Error Responses:**

- `400 Bad Request` - Refresh token is required

**Notes:**

- Refresh token is revoked and cannot be used again
- Access token remains valid until expiry (client should discard it)

---

## 🔄 Authentication Flow

### New User Registration Flow

```
1. User calls /auth/login with email & password
   ↓
2. System generates 6-digit OTP (valid for 5 minutes)
   ↓
3. OTP sent to user's email
   ↓
4. User calls /auth/verify-otp with OTP and profile details
   ↓
5. System validates OTP and creates user account
   ↓
6. User receives access token and refresh token
```

### Existing User Login Flow

```
1. User calls /auth/login with email & password
   ↓
2. System validates credentials
   ↓
3. User receives access token and refresh token
```

### Token Refresh Flow

```
1. Access token expires (after 15 minutes)
   ↓
2. Client calls /auth/refresh with refresh token
   ↓
3. System validates refresh token
   ↓
4. Old refresh token is revoked
   ↓
5. New access token and refresh token are issued
```

---

## ❌ Error Handling

All error responses follow a consistent format:

```json
{
	"timestamp": "2025-12-14T10:30:45.123",
	"status": 400,
	"error": "Bad Request",
	"message": "Invalid email format",
	"errors": {
		"email": "Invalid email format"
	}
}
```

### Common HTTP Status Codes

| Code | Description                                 |
| ---- | ------------------------------------------- |
| 200  | Success                                     |
| 400  | Bad Request - Invalid input data            |
| 401  | Unauthorized - Invalid credentials or token |
| 403  | Forbidden - User blocked or deleted         |
| 404  | Not Found - Resource not found              |
| 409  | Conflict - User already exists              |
| 500  | Internal Server Error                       |

### Common Error Messages

#### Login Errors

- `"Email is required"`
- `"Password is required"`
- `"Invalid email format"`
- `"Invalid Credentials"`
- `"This user id is BLOCKED, cannot login"`
- `"User has not set a password, cannot login"`

#### OTP Errors

- `"OTP not found"`
- `"OTP has expired. Please request a new OTP."`
- `"Invalid OTP"`
- `"Invalid user"`

#### Token Errors

- `"Refresh token is required"`
- `"Invalid refresh token"`
- `"Refresh token has been revoked"`
- `"Refresh token has expired"`
- `"User not found"`

---

## 🔐 Security Features

1. **Password Encryption** - All passwords are encrypted before storage
2. **JWT Tokens** - Stateless authentication using JWT
3. **Token Rotation** - Old refresh tokens are revoked when new ones are issued
4. **OTP Expiry** - OTPs expire after 5 minutes
5. **Token Hash Storage** - Refresh tokens are stored as SHA-256 hashes
6. **Input Validation** - All inputs are validated against strict patterns

---

## 📝 User Status Enum

| Status               | Description                          |
| -------------------- | ------------------------------------ |
| ACTIVE               | User account is active and can login |
| PENDING_VERIFICATION | User needs to verify OTP             |
| BLOCKED              | User account is blocked              |
| DELETED              | User account is deleted              |

---

## 🧪 Testing with cURL

### Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password@123"
  }'
```

### Verify OTP

```bash
curl -X POST http://localhost:8080/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dob": "1990-05-15",
    "phone": "9876543210",
    "email": "user@example.com",
    "password": "Password@123",
    "otp": "123456"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### Logout

```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

## 📄 License

This project is proprietary and confidential.

## 👥 Contributors

Zytra Bus Development Team

---

## 📞 Support

For issues or questions, please contact the development team.
