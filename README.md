# Zytra Bus — Bus Booking Platform

A full-stack bus booking platform consisting of a Next.js frontend (`user_app`) and a Spring Boot backend (`user_server`). This repository provides the UI, API, and services for searching buses, booking seats, managing user accounts, and processing payments.

> NOTE: Screenshots and demo GIFs — add your images to the `docs/screenshots` folder and update paths below.

<!-- PLACEHOLDER: Add screenshots here -->

![Screenshot 1](docs/screenshots/screenshot-1.png)
![Screenshot 2](docs/screenshots/screenshot-2.png)

**Project Highlights**

- **Frontend:** Next.js 16 + React 19, Tailwind CSS.
- **Backend:** Spring Boot (Java 21), PostgreSQL, JPA, JWT auth.
- **State & Data:** TanStack Query, Axios, Zustand.
- **Auth & Email:** JWT-based authentication and Spring Mail for verifications.

**Table of Contents**

- [Tech stack](#tech-stack)
- [Quickstart](#quickstart)
- [Development](#development)
- [Environment variables](#environment-variables)
- [API (overview)](#api-overview)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript (partial), Tailwind CSS
- Backend: Spring Boot 4, Java 21, Spring Data JPA, PostgreSQL
- Auth: JWT (io.jsonwebtoken)
- HTTP: Axios
- State & Query: Zustand, @tanstack/react-query

## Unique Selling Points

This platform is designed with production-grade booking safety and concurrency handling in mind. Key capabilities:

- **Seat locking / reservation holds:** When a user starts a booking flow the selected seats are placed on a short reservation hold (configurable TTL). Holds prevent other users from selecting the same seats while the booking completes.

- **Atomic bookings with DB transactions:** Final seat assignments are committed inside database transactions via Spring Data JPA to ensure either the whole booking succeeds or nothing is changed.

- **Double-booking prevention:** Database-level constraints (unique indexes) combined with optimistic checks at the service layer prevent duplicate seat assignment; conflicts return a clear error and a prompt to re-select seats.

- **Optimistic concurrency control & versioning:** Entities include a version/timestamp field to detect concurrent updates and to retry or surface conflict resolution to clients.

- **Distributed locking (optional):** For horizontally scaled deployments, the system can use a Redis-based distributed lock to coordinate seat allocation across instances.

- **Idempotent booking APIs:** Booking endpoints are designed to be idempotent (client-provided idempotency keys) so retries from network issues won't create duplicate bookings.

- **User feedback & real-time updates:** The frontend uses short-polling or WebSocket/Server-Sent-Events hooks to refresh seat availability in near-real time so users see accurate availability.

- **Audit logs & reconciliation:** All booking attempts and state transitions are auditable; reconciliation processes can detect and resolve stale holds or mismatches.

These mechanisms together ensure reliable concurrent booking handling, reduced user friction, and minimized risk of overbooking.

## Quickstart

Prerequisites:

- Node.js 18+ and npm/yarn
- Java 21 and Maven
- PostgreSQL (or a DB compatible with the provided JDBC URL)

1. Clone the repo

```bash
git clone <repo-url>
cd Zytra_Bus
```

2. Frontend (development)

```bash
cd user_app
npm install
npm run dev
```

This starts the Next.js dev server (default: http://localhost:3000).

3. Backend (development)

```bash
cd user_server
mvn spring-boot:run
```

By default Spring Boot will start on port 8080. Adjust ports and base URLs in the frontend `lib/api/client.ts` if necessary.

## Development

- Frontend scripts are in [user_app/package.json](user_app/package.json).

  - `npm run dev` — start dev server
  - `npm run build` — build production app
  - `npm run start` — start built app

- Backend uses Maven; inspect [user_server/pom.xml](user_server/pom.xml) for dependencies and plugins.

## Environment variables

Create `.env` files for local development for both frontend and backend. Example variables (adjust names to match your code):

- Backend (Spring Boot `application.properties` / env vars):

  - `SPRING_DATASOURCE_URL` — JDBC URL (e.g. `jdbc:postgresql://localhost:5432/zytra`)
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
  - `JWT_SECRET` — secret used to sign JWT tokens
  - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` — for email

- Frontend (Next.js):
  - `NEXT_PUBLIC_API_BASE_URL` — e.g. `http://localhost:8080/api`

Put `.env.local` in `user_app` for local Next.js overrides.

## API (overview)

The backend exposes REST endpoints for authentication, users, buses, and bookings. Typical routes (adjust to match controllers):

- `POST /api/auth/login` — login, returns JWT
- `POST /api/auth/register` — create user
- `GET /api/bus` — search/list buses
- `POST /api/bookings` — create a booking
- `GET /api/bookings/{id}` — booking details

Check the `user_server/src/main/java/com/zytra/user_server` package for controller implementations for exact routes and payload shapes.

## Project structure

- `user_app/` — Next.js frontend. See [user_app/package.json](user_app/package.json).
- `user_server/` — Spring Boot backend. See [user_server/pom.xml](user_server/pom.xml).
- `Driver_App/` — (contains `hello.js`) — driver-side utilities or separate micro-app.

## Testing

- Frontend lint: run `npm run lint` inside `user_app`.
- Backend tests: `mvn test` inside `user_server`.

## Deployment

- Frontend: build with `npm run build` then serve using `npm run start`, or export for static hosting where applicable.
- Backend: package with `mvn package` and run the generated JAR, or deploy to your preferred Java host/container.

## Contributing

- Fork, create a feature branch, add tests, and open a PR with a clear description.

## License

Specify your license here (e.g. MIT). Replace this section with your chosen license.

## Contact

Maintainer: Your Name — update with email or links.
