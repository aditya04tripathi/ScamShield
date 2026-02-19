# ScamShield Frontend 🌐

The user interface for the ScamShield platform, built with Next.js and Tailwind CSS.

## Overview

ScamShield Frontend provides a modern, interactive dashboard where users can submit emails, URLs, and audio files for scam analysis. It transforms complex backend data into clear, actionable risk reports.

## Key Features

- **Multi-Modal Dashboard**: Specialized interfaces for different scan types.
- **Dynamic Risk Visualization**: Real-time charts and indicators for risk levels.
- **Scan History**: Full history management with MongoDB integration.
- **Auth Systems**: Integrated user authentication and session management.
- **Responsive Design**: Optimized for desktop and mobile security scanning.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide React** (Icons)
- **MongoDB** (Mongoose)

## Setup and Installation

### Prerequisites

- [Bun](https://bun.sh/) (Recommended) or Node.js 20+

### Local Development

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Configure Environment**:
   Create a `.env.local` file with:

   ```env
   MONGODB_URI=your_mongodb_uri
   MICROSERVICE_URL=http://localhost:8000
   ```

4. **Start the development server**:

   ```bash
   bun dev
   ```

5. **Open the app**:
   Visit `http://localhost:3000`

## Documentation

- [Frontend SRS](./SRS.md)
- [Project-level SRS](../SRS.md)

## License

Licensed under the [MIT License](../LICENSE).
