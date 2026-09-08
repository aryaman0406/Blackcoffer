# Architecture Documentation

## Overview

This repository contains a full-stack data visualization dashboard monorepo composed of an Express + TypeScript + Mongoose backend service and a React + TypeScript + Vite + Tailwind CSS frontend application.

```
dashboard-project/
├── backend/                  # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/          # Environment and database configuration
│   │   ├── controllers/     # HTTP route controllers
│   │   ├── middleware/      # Error handler, request logger, security
│   │   ├── models/          # Mongoose schemas and models
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Query building and aggregation logic
│   │   └── validators/      # Zod schemas for query parameters
│   ├── scripts/             # Data ingestion and seed scripts
│   └── tests/               # Backend integration and unit tests
├── frontend/                 # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── api/             # API clients and HTTP helpers
│   │   ├── charts/          # Interactive chart components
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript interfaces and types
│   │   └── utils/           # Utility functions
│   └── tests/               # Frontend component tests
└── docs/                     # Documentation & assets
```

## Backend Architecture

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB via Mongoose ODM
- **Validation**: Zod schema validation for request parameters and query strings
- **Testing**: Vitest + Supertest

## Frontend Architecture

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library + jsdom

## CI/CD & Quality Control

- **Pre-commit Hooks**: Husky runs lint, typecheck, and test commands before every commit.
- **Continuous Integration**: GitHub Actions validates formatting, linting, type safety, test suites, and production builds on every push/PR.
