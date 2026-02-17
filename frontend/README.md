# ScamShield Frontend

## Overview

The **ScamShield Frontend** is a Next.js 16 application using the App Router. It provides the user interface for authenticating users, submitting content for scanning, visualizing risk scores, and managing community reports. It acts as a Backend-for-Frontend (BFF), orchestrating calls to the ML Microservice via Server Actions.

## Key Features

- **Modern UI:** Built with Radix UI and Tailwind CSS 4 for a responsive, accessible design.
- **Dashboard:** Unified view of recent activities and quick scan actions.
- **Detailed Results:** Visualizes risk scores with color-coded tiers and graphical confidence meters.
- **Secure Auth:** Custom JWT-based session management with HTTP-only cookies.
- **Admin Panel:** specialized interface for analysts to review user-submitted reports.

## Tech Stack

- **Framework:** Next.js 16.1.6
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Database:** Mongoose (MongoDB ODM)
- **Runtime:** Bun / Node.js
- **Icons:** Lucide React

## Architecture Overview

The frontend interacts with the backend ML service via **Server Actions**, ensuring sensitive logic and API keys remain on the server.

For detailed frontend architectural diagrams, including component hierarchy and data flow, please refer to the **[Documentation Folder](../docs)**.

## Setup and Installation

### Prerequisites

- Bun 1.1+ (or Node.js 18+)
- MongoDB Instance
- Backend Service running on port 8000

### Installation

```bash
cd frontend
bun install
```

### Running Locally

```bash
# Create environment file
cp .env.example .env.local

# Start development server
bun dev
```

The app will be available at `http://localhost:3000`.

## Usage

- **Development:** `bun dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`

## Configuration

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/scamshield
MICROSERVICE_URL=http://localhost:8000
JWT_SECRET_KEY=your-secret-key-min-32-chars
```

| Variable           | Description                         |
| ------------------ | ----------------------------------- |
| `MONGODB_URI`      | Connection string for MongoDB.      |
| `MICROSERVICE_URL` | URL of the running FastAPI backend. |
| `JWT_SECRET_KEY`   | Secret used to sign session tokens. |

## Deployment

The application is Docker-ready.

```bash
docker build -t scamshield-frontend .
docker run -p 3000:3000 --env-file .env.local scamshield-frontend
```

## Limitations and Assumptions

- **Auth:** Sessions are currently strictly cookie-based; requires same-site configuration for local dev if frontend/backend domains differ (handled via proxy or CORS).
- **File Uploads:** Currently limits file size to 10MB for scan uploads.

## Future Improvements

- **PWA Support:** Offline capabilities for viewing history.
- **Dark Mode:** System-aware theme switching (Partial support currently).
