# Visitor Pass Management System (VisiPass)

VisiPass is a MERN-stack application designed to digitize visitor entry management for offices and institutions. It replaces manual paper logbooks with a digital check-in workflow including email OTP validation, host approvals, QR-code pass generation, webcam photo capture, and check-in/out logging.

## Core Features

- **Role-Based Portals:** Dedicated dashboards for Administrators, Hosts, and Security officers.
- **Visitor Pre-Registration:** Self-service registration page with webcam snapshot support and email verification.
- **OTP Verification:** Generates 6-digit verification codes for visitor validation.
- **QR Code Badges:** Generates printable visitor badges with integrated check-in QR codes.
- **Gate Checkpoint Scanning:** Real-time camera-based scanning to log entries and exits.
- **Analytics & Exports:** Dashboard metrics and logs exportable to CSV.
- **Dockerization:** Containerized setup using Docker Compose and Nginx reverse proxy.

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/          # DB, mailer, and seeding configurations
│   │   ├── controllers/     # Auth, appointments, passes, and log handlers
│   │   ├── middleware/      # JWT validation and role guards
│   │   ├── models/          # Mongoose schemas (User, Visitor, Appointment, Pass, CheckLog)
│   │   ├── routes/          # Express route definitions
│   │   └── app.js           # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI elements, camera capture, and QR scanner
│   │   ├── context/         # Auth and Toast notification providers
│   │   ├── pages/           # Portal login, registration, and role dashboards
│   │   ├── App.jsx          # Route configurations
│   │   └── index.css        # Stylesheet and custom theme tokens
│   ├── index.html
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── package.json            # Root workspace configuration
```

## Local Development

### Prerequisites

- Node.js (v18+)
- MongoDB running locally on port 27017, or a remote MongoDB Atlas URI.

### 1. Installation

Install dependencies across all directories:
```bash
npm run install-all
```

### 2. Configuration

Create a `.env` file in the `backend` folder:
```bash
cp backend/.env.example backend/.env
```
Update the `MONGODB_URI` or SMTP settings inside `backend/.env` if you want to use custom connections.

### 3. Seed Database

Seed the database with default staff accounts and dummy logs:
```bash
npm run seed --prefix backend
```

### 4. Running the App

Start both front and backend development servers concurrently:
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## Deployment with Docker

Build and run the entire stack:
```bash
docker-compose up --build
```
Access the application on: `http://localhost`

To seed the docker database once the containers are running:
```bash
docker exec -it visipass_backend npm run seed
```

---

## Default Testing Accounts

Use these credentials to test the different dashboards:

| Account Type | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@visipass.com` | `admin123` |
| **Host (Engineering)** | `host1@visipass.com` | `host123` |
| **Security Checkpoint** | `security@visipass.com` | `security123` |
