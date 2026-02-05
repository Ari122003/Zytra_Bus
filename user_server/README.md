# Zytra Bus Booking System - Backend Server

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-yellow)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

A comprehensive, enterprise-grade backend system for bus ticket booking and management. Built with Spring Boot 4.0, this system provides real-time seat management, secure authentication, automated scheduling, and driver management capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [WebSocket Implementation](#websocket-implementation)
- [Security](#security)
- [Scheduled Tasks](#scheduled-tasks)
- [Email Notifications](#email-notifications)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 Overview

The Zytra Bus Booking System is a modern, scalable solution for managing bus bookings, route schedules, and driver assignments. The system features real-time seat availability updates via WebSocket, JWT-based authentication for both users and drivers, automated trip management, and comprehensive email notification system.

### Business Domain

- **User Management**: Registration, authentication, profile management
- **Bus Fleet Management**: Bus information, route planning, schedule management
- **Trip Management**: Dynamic trip generation, automated status updates
- **Booking System**: Seat locking mechanism, booking confirmation, payment tracking
- **Driver Operations**: Separate authentication, trip assignments, ticket verification
- **Real-time Updates**: WebSocket-based seat matrix updates

## ✨ Key Features

### 🔐 Dual Authentication System

- **User Authentication**: Email-based OTP verification, JWT tokens (access + refresh)
- **Driver Authentication**: Separate credential-based authentication with JWT
- **Session Management**: Refresh token rotation, device tracking, IP logging
- **Security**: BCrypt password hashing, token revocation, CORS configuration

### 🚌 Advanced Booking System

- **Real-time Seat Locking**: Temporary seat reservation with auto-expiration
- **Concurrent Booking Prevention**: Distributed locking mechanism
- **60-Day Booking Window**: Configurable advance booking period
- **Dynamic Fare Calculation**: Distance-based pricing (configurable per km)
- **Booking Reference Generation**: Unique identifiers for each booking

### 📡 Real-time Communication

- **WebSocket Integration**: Live seat availability updates
- **Topic-based Broadcasting**: Trip-specific subscription channels
- **Automatic Updates**: Pushes changes on lock, booking, or expiration
- **Fallback REST API**: Maintains compatibility for non-WebSocket clients

### 📅 Automated Task Management

- **Trip Status Updates**: Auto-updates trip status every 10 seconds
- **Seat Initialization**: Auto-creates seats for upcoming trips (30s interval)
- **Lock Expiration**: Clears expired seat locks every 30 seconds
- **Trip Reminders**: Email notifications 30 minutes before departure (10-min checks)

### 📧 Email Notification System

- **HTML Templates**: Professional, branded email templates using Thymeleaf
- **Notification Types**:
  - OTP verification emails
  - Registration confirmation
  - Booking confirmation with QR code
  - Trip reminder (30 mins before departure)
- **SMTP Integration**: Configurable email service (Gmail default)

### 🎫 Digital Ticketing

- **QR Code Generation**: Unique QR codes for each booking
- **Ticket Verification**: Driver-side ticket validation endpoint
- **Secure Tickets**: Time-limited validity, booking reference verification

## 🛠 Technology Stack

### Core Framework

- **Java 21**: Latest LTS version with modern language features
- **Spring Boot 4.0.0**: Latest Spring Boot framework
- **Spring Data JPA**: Object-relational mapping and repository abstraction
- **Hibernate**: ORM with PostgreSQL dialect

### Security

- **Spring Security**: Authentication and authorization framework
- **JWT (JSON Web Tokens)**: Stateless authentication (JJWT 0.11.5)
- **BCrypt**: Password hashing algorithm
- **CORS**: Cross-origin resource sharing configuration

### Database

- **PostgreSQL**: Primary relational database (Neon.tech cloud hosting)
- **Redis**: Caching layer for session management and performance
- **Connection Pooling**: HikariCP (Spring Boot default)

### Real-time Communication

- **Spring WebSocket**: WebSocket support
- **STOMP Protocol**: Simple Text Oriented Messaging Protocol
- **SockJS**: WebSocket fallback support

### Validation & Data Processing

- **Jakarta Validation**: Bean validation (JSR 380)
- **Lombok**: Boilerplate code reduction
- **Jackson**: JSON serialization/deserialization

### Email & Templates

- **Spring Mail**: Email sending capabilities
- **Jakarta Mail API**: Email interfaces (2.1.3)
- **Angus Mail**: SMTP implementation (2.0.3)
- **Thymeleaf**: Server-side template engine for HTML emails

### Utilities

- **ZXing**: QR code generation (3.5.3)
- **Maven**: Build automation and dependency management

### Development Tools

- **Spring DevTools**: Hot reload and development utilities
- **Spring Boot Test**: Testing framework

### Containerization

- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
- **Multi-stage Builds**: Optimized image size

## 🏗 System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Controller Layer                      │
│  (REST APIs, WebSocket Endpoints, Request Handling)     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│    (Business Logic, Transaction Management, etc.)       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│         (Data Access, JPA Repositories)                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Database Layer                       │
│              (PostgreSQL + Redis Cache)                  │
└─────────────────────────────────────────────────────────┘
```

### Module Organization

- **auth**: User authentication and authorization
- **driver_auth**: Driver-specific authentication
- **user**: User profile management
- **driver**: Driver profile and information
- **bus**: Bus fleet management
- **routes**: Route information
- **schedule**: Bus schedule management
- **trips**: Trip generation and management
- **seat**: Seat availability and locking
- **bookings**: Booking creation and management
- **payments**: Payment tracking
- **tickets**: Ticket generation and QR codes
- **driver_trips**: Driver trip operations
- **Notification**: Email and notification services
- **config**: Application configuration (Security, WebSocket, etc.)
- **util**: Utility classes (JWT, QR code generation, etc.)
- **exception**: Custom exception handling
- **enums**: Application enumerations

## 🚀 Getting Started

### Prerequisites

- **Java 21** or higher
- **Maven 3.9+**
- **PostgreSQL 15+** (or use provided Neon.tech configuration)
- **Redis** (for caching)
- **Docker & Docker Compose** (optional, for containerized deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd user_server
   ```

2. **Configure environment variables**

   Create `.env` file or update `application.properties`:

   ```properties
   # Database
   spring.datasource.url=jdbc:postgresql://your-host:5432/your-db
   spring.datasource.username=your-username
   spring.datasource.password=your-password

   # JWT Secret (minimum 32 characters)
   jwt.secret=your-secure-secret-key-at-least-32-characters-long

   # Email Configuration
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password

   # Redis
   spring.data.redis.host=localhost
   spring.data.redis.port=6379
   ```

3. **Build the project**

   ```bash
   ./mvnw clean install
   ```

4. **Run the application**

   ```bash
   ./mvnw spring-boot:run
   ```

   Or run the JAR:

   ```bash
   java -jar target/user_server-0.0.1-SNAPSHOT.jar
   ```

5. **Verify the application**

   The server will start on `http://localhost:8080`

   Check console output: `User Server is running...`

### Docker Deployment

1. **Using Docker Compose** (recommended)

   ```bash
   docker-compose up --build
   ```

2. **Using Docker directly**

   ```bash
   # Build image
   docker build -t zytra-user-server .

   # Run container
   docker run -p 8080:8080 \
     -e SPRING_DATASOURCE_URL=your-db-url \
     -e JWT_SECRET=your-secret \
     zytra-user-server
   ```

3. **Health Check**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:8080
```

### Authentication Endpoints

#### User Authentication

| Method | Endpoint                | Description                     | Auth Required |
| ------ | ----------------------- | ------------------------------- | ------------- |
| POST   | `/user/auth/login`      | User login (sends OTP to email) | No            |
| POST   | `/user/auth/verify-otp` | Verify OTP and get tokens       | No            |
| POST   | `/user/auth/refresh`    | Refresh access token            | No            |
| POST   | `/user/logout`          | Logout and revoke refresh token | Yes           |

**Login Request:**

```json
{
	"email": "user@example.com",
	"password": "securePassword123"
}
```

**Verify OTP Request:**

```json
{
	"email": "user@example.com",
	"otp": "123456"
}
```

**Login/OTP Response:**

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

#### Driver Authentication

| Method | Endpoint                | Description                 | Auth Required |
| ------ | ----------------------- | --------------------------- | ------------- |
| POST   | `/driver/auth/register` | Register new driver         | No            |
| POST   | `/driver/auth/login`    | Driver login                | No            |
| POST   | `/driver/auth/refresh`  | Refresh driver access token | No            |
| POST   | `/driver/logout`        | Driver logout               | Yes           |

### User Management

| Method | Endpoint                            | Description               | Auth Required |
| ------ | ----------------------------------- | ------------------------- | ------------- |
| GET    | `/user/users/{userId}/details`      | Get user profile details  | Yes           |
| PUT    | `/user/users/{userId}/update-image` | Update user profile image | Yes           |
| PUT    | `/user/users/{userId}/update-info`  | Update user information   | Yes           |

**Update User Info Request:**

```json
{
	"name": "John Doe",
	"phone": "+1234567890",
	"dateOfBirth": "1990-01-01T00:00:00"
}
```

### Bus Search

| Method | Endpoint             | Description            | Auth Required |
| ------ | -------------------- | ---------------------- | ------------- |
| GET    | `/user/buses/search` | Search available buses | No            |

**Query Parameters:**

- `source` (required): Departure city
- `destination` (required): Arrival city
- `travelDate` (required): Date in ISO format (YYYY-MM-DD)
- `currentTime` (optional): Current time in ISO format (HH:mm:ss)

**Example:**

```
GET /user/buses/search?source=Mumbai&destination=Pune&travelDate=2026-02-15
```

**Response:**

```json
{
	"trips": [
		{
			"tripId": 123,
			"busNumber": "MH-01-1234",
			"departureTime": "09:00:00",
			"arrivalTime": "12:30:00",
			"availableSeats": 25,
			"fare": 375.0,
			"status": "AVAILABLE",
			"seatStatus": "AVAILABLE"
		}
	]
}
```

### Trip Management

| Method | Endpoint               | Description      | Auth Required |
| ------ | ---------------------- | ---------------- | ------------- |
| GET    | `/user/trips/{tripId}` | Get trip details | No            |

### Seat Management

| Method | Endpoint           | Description            | Auth Required |
| ------ | ------------------ | ---------------------- | ------------- |
| POST   | `/user/seats/lock` | Lock seats for booking | Yes           |

**Lock Seats Request:**

```json
{
	"tripId": 123,
	"seats": ["A1", "A2"],
	"lockOwner": 1
}
```

**Lock Seats Response:**

```json
{
	"message": "Seats locked successfully",
	"lockedSeats": ["A1", "A2"],
	"lockedUntil": "2026-02-05T14:25:00",
	"lockDurationSeconds": 300
}
```

### Booking Management

| Method | Endpoint                            | Description         | Auth Required |
| ------ | ----------------------------------- | ------------------- | ------------- |
| POST   | `/user/booking/create`              | Create new booking  | Yes           |
| GET    | `/user/booking/{userId}`            | Get user bookings   | Yes           |
| GET    | `/user/booking/details/{bookingId}` | Get booking details | Yes           |

**Create Booking Request:**

```json
{
	"tripId": 123,
	"userId": 1,
	"seatNumbers": ["A1", "A2"],
	"amount": 750.0
}
```

**Booking Response:**

```json
{
	"bookingId": 456,
	"bookingReference": "BK-20260205-456",
	"status": "CONFIRMED",
	"totalAmount": 750.0,
	"seats": ["A1", "A2"],
	"qrCode": "data:image/png;base64,iVBORw0KG...",
	"message": "Booking confirmed successfully"
}
```

### Driver Operations

| Method | Endpoint                            | Description               | Auth Required |
| ------ | ----------------------------------- | ------------------------- | ------------- |
| GET    | `/driver/{driverId}/details`        | Get driver profile        | Yes           |
| PUT    | `/driver/{driverId}/update`         | Update driver information | Yes           |
| GET    | `/driver/current-trip/{driverId}`   | Get current trip          | Yes           |
| GET    | `/driver/upcoming-trips/{driverId}` | Get upcoming trips        | Yes           |
| PATCH  | `/driver/verify-ticket/{bookingId}` | Verify passenger ticket   | Yes           |

## 🗄 Database Schema

### Core Tables

#### Users

```sql
users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) UNIQUE NOT NULL,
  date_of_birth TIMESTAMP NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- ACTIVE, INACTIVE, SUSPENDED
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  last_login_at TIMESTAMP
)
```

#### Drivers

```sql
drivers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  assigned_route_id BIGINT REFERENCES routes(id),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  role VARCHAR(20) DEFAULT 'DRIVER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  last_login_at TIMESTAMP
)
```

#### Trips

```sql
trips (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT REFERENCES schedules(id),
  travel_date DATE NOT NULL,
  available_seats INT NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  driver_id BIGINT REFERENCES drivers(id) UNIQUE,
  status VARCHAR(20) NOT NULL, -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  seat_status VARCHAR(20) NOT NULL, -- AVAILABLE, FILLING_FAST, SOLD_OUT
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, travel_date)
)
```

#### Seats

```sql
seats (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT REFERENCES trips(id) ON DELETE CASCADE,
  seat_number VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL, -- AVAILABLE, LOCKED, BOOKED
  booking_id BIGINT REFERENCES bookings(id),
  locked_until TIMESTAMP,
  lock_owner_id BIGINT REFERENCES users(id),
  UNIQUE(trip_id, seat_number)
)
```

#### Bookings

```sql
bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  trip_id BIGINT REFERENCES trips(id),
  seat_count INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status VARCHAR(20), -- PENDING, CONFIRMED, CANCELLED, EXPIRED
  booking_reference VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

For complete schema, see [database_schema.dbml](database_schema.dbml)

### Key Relationships

- **Users** → **Bookings** (1:N)
- **Trips** → **Seats** (1:N)
- **Bookings** → **Seats** (N:M via booking_seats junction table)
- **Bookings** → **Tickets** (1:1)
- **Drivers** → **Routes** (N:1 - assigned route)
- **Drivers** → **Trips** (1:1 - current trip assignment)

## 🔌 WebSocket Implementation

### Real-time Seat Matrix Updates

The system uses WebSocket with STOMP protocol for real-time seat availability updates.

#### Connection Setup

**Endpoint:** `ws://localhost:8080/ws`

**JavaScript Example:**

```javascript
const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
	console.log("Connected: " + frame);

	// Subscribe to trip-specific seat updates
	stompClient.subscribe("/topic/seat-matrix/123", function (message) {
		const seatMatrix = JSON.parse(message.body);
		updateSeatUI(seatMatrix);
	});

	// Request current seat matrix
	stompClient.send("/app/seat-matrix/123", {}, "{}");
});
```

#### Subscription Topics

| Topic                         | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `/topic/seat-matrix/{tripId}` | Real-time seat availability for specific trip |

#### Message Endpoints

| Endpoint                    | Description                 |
| --------------------------- | --------------------------- |
| `/app/seat-matrix/{tripId}` | Request current seat matrix |

#### Update Triggers

Seat matrix updates are automatically broadcast when:

1. User locks seats
2. User completes booking
3. Seat locks expire (every 30 seconds)
4. Seats are manually unlocked

#### Message Format

```json
[
	[
		{
			"seatId": 1,
			"seatNumber": "A1",
			"status": "AVAILABLE",
			"lockOwner": null,
			"lockedUntil": null
		},
		{
			"seatId": 2,
			"seatNumber": "A2",
			"status": "LOCKED",
			"lockOwner": 123,
			"lockedUntil": "2026-02-05T14:25:00"
		}
	]
]
```

For detailed WebSocket documentation, see [docs/REALTIME_SEAT_MATRIX_IMPLEMENTATION.md](docs/REALTIME_SEAT_MATRIX_IMPLEMENTATION.md)

## 🔒 Security

### Authentication Flow

#### User Authentication

1. User sends credentials to `/user/auth/login`
2. System validates credentials and sends OTP to email
3. User submits OTP to `/user/auth/verify-otp`
4. System validates OTP and returns JWT tokens
5. Client stores tokens and uses access token in Authorization header

#### Token Structure

- **Access Token**: Short-lived (15 minutes default), used for API authentication
- **Refresh Token**: Long-lived (90 days default), used to obtain new access tokens
- **Token Storage**: Refresh tokens stored in database with metadata (device, IP, issued time)

### Security Features

- **Password Encryption**: BCrypt with configurable strength
- **JWT Signing**: HMAC-SHA256 algorithm
- **Token Rotation**: Refresh tokens are rotated on each refresh
- **Token Revocation**: Tokens can be revoked (logout)
- **Session Tracking**: Device and IP logging for security audit
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Jakarta Validation on all request DTOs
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries

### Authorization Header Format

```
Authorization: Bearer <access-token>
```

### Environment Variables (Sensitive)

Never commit these to version control:

- `JWT_SECRET`: JWT signing secret (minimum 32 characters)
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `SPRING_MAIL_PASSWORD`: Email service password

## ⏰ Scheduled Tasks

The system includes several automated background tasks:

| Task                | Interval   | Description                                                                         |
| ------------------- | ---------- | ----------------------------------------------------------------------------------- |
| Trip Status Update  | 10 seconds | Updates trip status based on travel date/time (SCHEDULED → IN_PROGRESS → COMPLETED) |
| Seat Initialization | 30 seconds | Creates seat records for newly created trips                                        |
| Lock Expiration     | 30 seconds | Releases expired seat locks and broadcasts updates                                  |
| Trip Reminders      | 10 minutes | Sends email reminders 30 minutes before trip departure                              |

### Task Details

#### Trip Status Scheduler

- **File**: `trips/service/TripStatusScheduler.java`
- **Frequency**: Fixed rate - 10,000ms (10 seconds)
- **Function**: Automatically transitions trips through their lifecycle

#### Seat Creation Service

- **File**: `seat/service/SeatCreationService.java`
- **Frequency**: Fixed rate - 30,000ms (30 seconds)
- **Function**: Initializes seats for trips without seat records

#### Clear Expired Locks

- **File**: `seat/service/ClearExpiredLocksService.java`
- **Frequency**: Fixed rate - 30,000ms (30 seconds)
- **Function**: Unlocks seats where lock time has expired

#### Trip Reminder Scheduler

- **File**: `Notification/TripReminderScheduler.java`
- **Frequency**: Fixed rate - 600,000ms (10 minutes)
- **Function**: Sends departure reminder emails to passengers

## 📧 Email Notifications

### Email Templates

All email templates are located in `src/main/resources/emails/`:

1. **otp-verification.html**: OTP codes for user authentication
2. **registration_completed.html**: Welcome email after successful registration
3. **booking_confirmed.html**: Booking confirmation with QR code and trip details
4. **trip_starting_soon.html**: 30-minute pre-departure reminder

### Email Configuration

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Template Engine

- **Thymeleaf**: Server-side HTML template processing
- **Variables**: Dynamic content injection (user name, booking details, QR codes)
- **Styling**: Inline CSS for email client compatibility

### Email Features

- **HTML Formatting**: Professional, responsive email design
- **QR Code Embedding**: Base64-encoded QR codes in booking confirmations
- **Dynamic Content**: Personalized with user and booking information
- **Error Handling**: Graceful failure without blocking main operations

## 🐳 Docker Deployment

### Dockerfile (Multi-stage Build)

The application uses a multi-stage Docker build for optimization:

**Stage 1: Build**

- Base image: `maven:3.9-eclipse-temurin-21-alpine`
- Downloads dependencies (cached layer)
- Compiles source code
- Packages JAR file

**Stage 2: Runtime**

- Base image: `eclipse-temurin:21-jre-alpine`
- Minimal JRE-only image
- Non-root user for security
- Health check endpoint
- Exposed port: 8080

### Docker Compose

The `docker-compose.yml` provides complete container orchestration:

```yaml
services:
  user-server:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=${SPRING_DATASOURCE_URL}
      - JWT_SECRET=${JWT_SECRET}
      # ... other environment variables
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks:
      - zytra-network
```

### Container Features

- **Health Checks**: Automatic container health monitoring
- **Restart Policy**: Automatic restart on failure
- **Resource Limits**: Configurable memory and CPU limits
- **JVM Optimization**: Container-aware heap sizing
- **Non-root Execution**: Enhanced security
- **Network Isolation**: Custom Docker network

### Deployment Commands

```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f user-server

# Stop services
docker-compose down

# Rebuild without cache
docker-compose build --no-cache
```

## ⚙ Configuration

### Application Properties

Key configuration properties in `application.properties`:

#### Server Configuration

```properties
spring.application.name=user_server
server.error.include-message=never
server.error.include-stacktrace=never
```

#### Database Configuration

```properties
spring.datasource.url=jdbc:postgresql://host:port/database
spring.datasource.username=username
spring.datasource.password=password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

#### Redis Configuration

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

#### JWT Configuration

```properties
jwt.secret=your-secure-secret-minimum-32-characters
jwt.access.token.expiration-minutes=15
jwt.refresh.token.expiration-days=90
```

#### Business Configuration

```properties
booking.window.days=60
fare.per.km=2.5
```

### Environment-specific Configuration

For different environments (dev, staging, prod), create:

- `application-dev.properties`
- `application-staging.properties`
- `application-prod.properties`

Activate with:

```bash
java -jar app.jar --spring.profiles.active=prod
```

## 📁 Project Structure

```
user_server/
├── src/
│   ├── main/
│   │   ├── java/com/zytra/user_server/
│   │   │   ├── UserServerApplication.java         # Main application entry point
│   │   │   ├── auth/                              # User authentication
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── exception/
│   │   │   │   ├── repository/
│   │   │   │   └── service/
│   │   │   ├── driver_auth/                       # Driver authentication
│   │   │   ├── user/                              # User management
│   │   │   ├── driver/                            # Driver management
│   │   │   ├── bus/                               # Bus fleet management
│   │   │   ├── routes/                            # Route management
│   │   │   ├── schedule/                          # Schedule management
│   │   │   ├── trips/                             # Trip management
│   │   │   │   ├── controller/
│   │   │   │   │   ├── TripController.java
│   │   │   │   │   └── SeatMatrixWebSocketController.java
│   │   │   │   └── service/
│   │   │   │       └── TripStatusScheduler.java   # Scheduled status updates
│   │   │   ├── seat/                              # Seat management
│   │   │   │   ├── controller/
│   │   │   │   └── service/
│   │   │   │       ├── SeatCreationService.java
│   │   │   │       └── ClearExpiredLocksService.java
│   │   │   ├── bookings/                          # Booking management
│   │   │   ├── payments/                          # Payment tracking
│   │   │   ├── tickets/                           # Ticket generation
│   │   │   ├── driver_trips/                      # Driver trip operations
│   │   │   ├── Notification/                      # Notification services
│   │   │   │   └── TripReminderScheduler.java
│   │   │   ├── config/                            # Configuration classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── WebSocketConfig.java
│   │   │   ├── util/                              # Utility classes
│   │   │   │   └── JwtUtil.java
│   │   │   ├── exception/                         # Exception handling
│   │   │   └── enums/                             # Enumerations
│   │   └── resources/
│   │       ├── application.properties             # Configuration
│   │       └── emails/                            # Email templates
│   │           ├── otp-verification.html
│   │           ├── registration_completed.html
│   │           ├── booking_confirmed.html
│   │           └── trip_starting_soon.html
│   └── test/
│       └── java/com/zytra/user_server/
│           └── UserServerApplicationTests.java
├── docs/
│   ├── REALTIME_SEAT_MATRIX_IMPLEMENTATION.md
│   └── migrations/
│       └── driver_auth_separation.sql
├── target/                                         # Build output
├── database_schema.dbml                            # Database schema documentation
├── docker-compose.yml                              # Docker Compose configuration
├── Dockerfile                                      # Docker image definition
├── pom.xml                                         # Maven configuration
├── mvnw                                            # Maven wrapper (Unix)
├── mvnw.cmd                                        # Maven wrapper (Windows)
└── README.md                                       # This file
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=UserServiceTest

# Run with coverage
./mvnw test jacoco:report
```

### Test Structure

- **Unit Tests**: Service layer business logic
- **Integration Tests**: Repository and database interactions
- **Controller Tests**: API endpoint testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow Java naming conventions
- Use Lombok annotations to reduce boilerplate
- Write meaningful commit messages
- Add JavaDoc comments for public methods
- Maintain layered architecture (Controller → Service → Repository)

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Authors

- **Zytra Development Team**

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Contact: aritrarock2003@gmail.com

## 🗺 Roadmap

### Upcoming Features

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Mobile app API enhancements
- [ ] Loyalty program integration
- [ ] Dynamic pricing based on demand
- [ ] Route optimization algorithms
- [ ] Push notification support (FCM)
- [ ] Admin panel API
- [ ] Refund management system

### Performance Improvements

- [ ] Database query optimization
- [ ] Redis caching strategy enhancement
- [ ] Connection pool tuning
- [ ] API response compression
- [ ] CDN integration for static assets

---

**Built with ❤️ using Spring Boot 4.0 and Java 21**

_Last Updated: February 2026_
