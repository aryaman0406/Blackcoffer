# Data Visualization Dashboard Monorepo

A modern full-stack analytics dashboard platform built with Node.js, Express, TypeScript, Mongoose, React, Vite, and Tailwind CSS.

## Monorepo Layout

```
dashboard-project/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schema
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/        # query-building, aggregation logic
│   │   ├── validators/      # Zod schemas for query params
│   │   ├── middleware/      # error handler, request logger
│   │   └── config/
│   ├── scripts/
│   │   └── import-data.js   # one-time seed script
│   ├── tests/
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── charts/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
├── docs/
│   ├── architecture.md
│   ├── data-quality-notes.md
│   └── screenshots/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- MongoDB instance (local or Atlas)

### Installation

```bash
# Install root and all workspace dependencies
npm install

# Initialize Husky pre-commit hooks
npm run prepare
```

### Development

```bash
# Run backend development server
npm run dev --workspace=backend

# Run frontend development server
npm run dev --workspace=frontend
```

### Testing, Typechecking & Linting

```bash
# Run tests across all workspaces
npm run test

# Run TypeScript typechecks
npm run typecheck

# Run ESLint across all workspaces
npm run lint

# Format code with Prettier
npm run format
```

## Deploy on Render

Add the `render.yaml` file to the repository root. Render will automatically detect it and deploy the backend as a web service and the frontend as a static site. Ensure required environment variables are set in the Render dashboard (see `.env.example`).

