# Deployment Guide

This guide explains how to deploy the Real-Time Monitoring Dashboard to popular cloud platforms.

## Prerequisites

- A GitHub repository containing this project.
- Accounts on the chosen hosting provider.

## Option 1: Railway (Recommended for Ease of Use)

Railway can detect both the Node.js server and the Angular client (if built properly or served via Node). For a monorepo setup like this, it's best to deploy them as two separate services or use Docker.

### Using Docker (Simplest)

1.  Sign up at [Railway.app](https://railway.app/).
2.  Click **New Project** > **GitHub Repo**.
3.  Select this repository.
4.  Railway will detect the `docker-compose.yml` or `Dockerfile`.
    - _Note_: Railway typically builds from a single Dockerfile. Since we have two, you might need to configure two services pointing to the same repo but different root directories, OR use the Docker Compose support if enabled.
    - **Alternative**: Deploy just the `server` folder as one service, and the `client` as another (Static Site).

### Manual Setup (Separate Services)

**Backend (Node.js)**

1.  Create a new service from GitHub Repo.
2.  Settings > **Root Directory**: `server`
3.  Variables: Add `PORT` (Railway provides this automatically, but ensure code uses `process.env.PORT`).
4.  Copy the **Public Domain** (e.g., `web-production-123.up.railway.app`).

**Frontend (Angular)**

1.  Update `client/src/environments/environment.prod.ts` (create if missing) to point `apiUrl` and `socketUrl` to the Backend Public Domain.
2.  Create a new service from GitHub Repo.
3.  Settings > **Root Directory**: `client`
4.  Settings > **Build Command**: `npm run build`
5.  Settings > **Start Command**: `npx http-server dist/ng-tailadmin/browser -p $PORT` (You may need to add `http-server` to package.json dependencies).

## Option 2: Render

**Backend**

1.  New **Web Service**.
2.  Root Directory: `server`
3.  Build Command: `npm install`
4.  Start Command: `node src/index.js`
5.  Env Vars: `Node` creates `PORT` automatically.

**Frontend**

1.  New **Static Site**.
2.  Root Directory: `client`
3.  Build Command: `npm install && npm run build`
4.  Publish Directory: `dist/ng-tailadmin/browser`
5.  _Important_: Add a Rewrite Rule: Source `/*`, Destination `/index.html`, Action `Rewrite` (for Angular routing).
6.  Update environment variables/files to point to the Backend URL.

## Option 3: Azure App Service

1.  **VS Code Extension**: Install "Azure Resources".
2.  **Backend**:
    - Right-click `server` folder > "Deploy to Web App".
    - Select Node.js runtime.
3.  **Frontend**:
    - Run `ng build`.
    - Right-click `dist` folder > "Deploy to Static Web App".
