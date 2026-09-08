# Render Deployment Guide

This guide provides step-by-step instructions for deploying the Express + TypeScript backend to [Render](https://render.com).

---

## 1. Prerequisites

- A [Render](https://render.com) account.
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any hosted MongoDB URI).
- Your GitHub repository connected to Render.

---

## 2. Option A: Automated Deployment via Blueprint (`render.yaml`)

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your repository.
4. Render will detect [`render.yaml`](file:///c:/Users/acer/Desktop/Blackcoffer/render.yaml) automatically.
5. Provide the sensitive environment variables when prompted:
   - `MONGODB_URI`: Your MongoDB connection string (e.g. `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/blackcoffer?retryWrites=true&w=majority`).
   - `CLIENT_URL`: The deployed URL of your frontend application (e.g. `https://your-app.vercel.app`).
6. Click **Apply**.

---

## 3. Option B: Manual Web Service Setup

If you prefer setting up the Web Service manually:

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `blackcoffer-analytics-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)` or your preferred region
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install && npm run build --workspace=backend
     ```
   - **Start Command**:
     ```bash
     npm run start --workspace=backend
     ```
   - **Health Check Path**:
     ```text
     /health
     ```
4. Configure **Environment Variables**:

   | Variable         | Value                              | Description                                     |
   | :--------------- | :--------------------------------- | :---------------------------------------------- |
   | `NODE_ENV`       | `production`                       | Enables production mode & strict env validation |
   | `PORT`           | `10000`                            | Port assigned by Render                         |
   | `MONGODB_URI`    | `mongodb+srv://...`                | MongoDB connection string (Required)            |
   | `CLIENT_URL`     | `https://your-frontend.vercel.app` | Allowed CORS origin for your frontend           |
   | `RATE_LIMIT_MAX` | `500`                              | Max requests allowed per 15-minute window       |

5. Click **Deploy Web Service**.

---

## 4. Seeding Data to MongoDB Atlas

To seed your production or remote database with `jsondata.json`:

```bash
# Run from repository root with your remote MONGODB_URI
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/blackcoffer?retryWrites=true&w=majority" npm run seed -- --force
```

---

## 5. Verification & Health Check

Once the deployment completes:

- **Root Health Check**:
  ```bash
  curl https://<your-render-subdomain>.onrender.com/health
  ```
  Expected Response:
  ```json
  { "status": "ok", "timestamp": "...", "uptime": 12.34 }
  ```
- **API Endpoint**:
  ```bash
  curl https://<your-render-subdomain>.onrender.com/api/insights?limit=5
  ```
