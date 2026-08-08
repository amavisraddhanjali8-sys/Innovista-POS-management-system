# 🚀 Innovista Aluminium & Glass POS & ERP System
## Full Deployment & Administration Guide

This document provides complete, end-to-end documentation and technical instructions for deploying, configuring, and maintaining the **Innovista Aluminium & Glass Point of Sale (POS), Quotation & ERP System** across local, Docker, Google Cloud Run, and Linux VPS environments.

---

## 📋 Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Prerequisites & System Requirements](#2-prerequisites--system-requirements)
3. [Environment Configuration](#3-environment-configuration)
4. [Local Development Setup](#4-local-development-setup)
5. [Production Build Process](#5-production-build-process)
6. [Containerized Deployment (Docker & Docker Compose)](#6-containerized-deployment-docker--docker-compose)
7. [Cloud Deployment (Google Cloud Run)](#7-cloud-deployment-google-cloud-run)
8. [Linux VPS Deployment (Nginx + PM2 + SSL Certbot)](#8-linux-vps-deployment-nginx--pm2--ssl-certbot)
9. [Head Office Emergency Master Backup Recovery Key](#9-head-office-emergency-master-backup-recovery-key)
10. [Database Backup & Maintenance](#10-database-backup--maintenance)
11. [Monitoring & Troubleshooting](#11-monitoring--troubleshooting)

---

## 1. System Architecture Overview

Innovista POS is built as a full-stack web application designed for multi-branch operation with low latency, offline resilience, and robust state management.

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Motion animations, and QRCode generator.
* **Backend**: Node.js, Express, bundled with `esbuild` into a single CommonJS module (`dist/server.cjs`).
* **AI Engine**: Integrated Google Gemini 2.5 API (`@google/genai`) for automated quotation parsing, item extractions, and material estimations.
* **Database & Persistence**: Built-in JSON persistent datastore (`/data/db.json` with fallback in memory/localStorage sync) for real-time CRUD operations.
* **Security & Auth**: Role-Based Access Control (RBAC) with 6 roles (Head Office Super Admin, HO Admin, Branch Manager, Sales Executive, Auditor, Stock Keeper), Session Inactivity Timeout Enforcer, and Head Office Master Emergency Backup Key Recovery.

---

## 2. Prerequisites & System Requirements

### Minimum Hardware Specs (Per Server/Instance)
* **CPU**: 1 vCPU Core
* **RAM**: 1 GB (2 GB recommended for high concurrent load)
* **Storage**: 10 GB SSD / Persistent Volume

### Software Prerequisites
* **Node.js**: v18.x LTS or v20.x LTS (Recommended: v20.x)
* **npm**: v9.x or higher
* **Docker** (Optional for container deployments): v24.x+
* **Nginx** (Optional for VPS reverse proxy): v1.18+

---

## 3. Environment Configuration

Define required environment variables in a `.env` file at the root directory or configure them directly in your Cloud/VPS environment manager.

### Sample `.env` Configuration
```env
# Runtime Environment
NODE_ENV=production
PORT=3000

# Base URL of the Application
APP_URL=http://localhost:3000

# Google Gemini API Key (Server-Side Secret)
GEMINI_API_KEY=AIzaSy...
```

> ⚠️ **Security Notice**: Never expose `GEMINI_API_KEY` to client-side bundles. The backend proxies all AI calls through `/api/gemini` routes.

---

## 4. Local Development Setup

To run the application locally for development or testing:

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd innovista-pos
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Local Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings and API keys
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   *The server will boot on `http://localhost:3000` with hot reload enabled via Vite middleware.*

5. **Verify System Health**:
   Open a browser or terminal and check:
   ```bash
   curl http://localhost:3000/api/health
   # Response: {"status":"ok"}
   ```

---

## 5. Production Build Process

The build system leverages **Vite** for client bundle optimization and **esbuild** to compile `server.ts` into a self-contained production bundle.

### Build Command
```bash
npm run build
```

### Build Artifacts Output (`dist/` directory)
```
dist/
├── assets/            # Minified React JS, CSS, and SVG bundles
├── index.html         # SPA HTML entrypoint
└── server.cjs         # Single-file bundled Node.js Express server
```

### Testing Production Server Locally
```bash
npm start
```
*Executes `node dist/server.cjs` on port 3000.*

---

## 6. Containerized Deployment (Docker & Docker Compose)

The project includes a multi-stage `Dockerfile` and `docker-compose.yml` for instant, isolated deployment.

### Option A: Using Docker Directly

1. **Build Docker Image**:
   ```bash
   docker build -t innovista-pos:latest .
   ```

2. **Run Container with Volume Persistence**:
   ```bash
   docker run -d \
     --name innovista_app \
     -p 3000:3000 \
     -e GEMINI_API_KEY="your-gemini-api-key" \
     -e APP_URL="https://pos.innovista.lk" \
     -v pos_db_data:/app/data \
     --restart always \
     innovista-pos:latest
   ```

### Option B: Using Docker Compose

1. **Create `.env` File**:
   ```env
   GEMINI_API_KEY=your-gemini-key-here
   APP_URL=http://localhost:3000
   ```

2. **Start Services**:
   ```bash
   docker-compose up -d
   ```

3. **Check Running Containers**:
   ```bash
   docker-compose ps
   ```

4. **View Application Logs**:
   ```bash
   docker-compose logs -f innovista-pos
   ```

---

## 7. Cloud Deployment (Google Cloud Run)

Google Cloud Run offers serverless, autoscaling execution for containerized applications.

### Step 1: Install Google Cloud SDK & Login
```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: Build & Push Image to Artifact Registry
```bash
# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com

# Create Repository
gcloud artifacts repositories create pos-repo \
  --repository-format=docker \
  --location=asia-southeast1

# Submit Build
gcloud builds submit --tag asia-southeast1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/pos-repo/innovista-pos:v1
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy innovista-pos \
  --image asia-southeast1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/pos-repo/innovista-pos:v1 \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY="YOUR_GEMINI_KEY"
```

---

## 8. Linux VPS Deployment (Nginx + PM2 + SSL Certbot)

For standalone VPS hosts running Ubuntu 22.04 / 24.04 LTS:

### Step 1: Install Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### Step 2: Setup Application Directory
```bash
sudo mkdir -p /var/www/innovista-pos
sudo chown -R $USER:$USER /var/www/innovista-pos
cd /var/www/innovista-pos

# Clone code or copy build files
git clone <your-repo> .
npm install
npm run build
```

### Step 3: Configure PM2 Process Manager
Create `ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: "innovista-pos",
    script: "./dist/server.cjs",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      GEMINI_API_KEY: "YOUR_GEMINI_KEY",
      APP_URL: "https://pos.innovista.lk"
    }
  }]
};
```

Start app with PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/innovista`:
```nginx
server {
    listen 80;
    server_name pos.innovista.lk;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site & enable SSL via Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/innovista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL Certificate
sudo certbot --nginx -d pos.innovista.lk
```

---

## 9. Head Office Emergency Master Backup Recovery Key

The system features an enterprise-grade Emergency Recovery Key feature designed for Head Office Administrators:

1. **Location in UI**: `System Settings & Configuration` ➔ `User Management & Signing Approval` tab ➔ `Head Office Master Emergency Backup Recovery Key` panel.
2. **Key Definition**:
   - Head Office Super Admins can define, edit, activate, or deactivate a master key (e.g., `HO-KEY-8942-XK92-7710`).
   - The key status can be toggled between **Active** and **Deactivated**.
3. **Usage Scenarios**:
   - **Login Screen Recovery**: On the Login page (`/login`), users can switch to the **HO Emergency Backup Key** tab in the recovery modal to unlock locked accounts or perform emergency password resets.
   - **Admin Portal Emergency Reset**: Head Office Admins can click `Emergency Reset` on any user card in Settings to reset credentials using the active Master Key.

---

## 10. Database Backup & Maintenance

The application writes persistent system state to `/data/db.json` (or `/app/data/db.json` inside containers).

### Manual Backup Command
```bash
# Copy current database state
cp /var/www/innovista-pos/data/db.json /var/www/backups/db_backup_$(date +%Y%m%d_%H%M%S).json
```

### Automated Daily Backup Cron Job
Add to `crontab -e`:
```cron
0 2 * * * cp /var/www/innovista-pos/data/db.json /var/www/backups/db_backup_$(date +\%Y\%m\%d).json
```

---

## 11. Monitoring & Troubleshooting

### Viewing Application Logs
* **PM2 Logs**: `pm2 logs innovista-pos`
* **Docker Logs**: `docker logs -f innovista_app`
* **Cloud Run Logs**: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=innovista-pos"`

### Common Issues & Solutions

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Port 3000 in use** | Another process occupies port 3000 | Kill process: `lsof -ti:3000 \| xargs kill -9` or change `PORT` in `.env`. |
| **Emergency Recovery Key Rejected** | Key is deactivated or mismatched | Check `ho_backup_key_status` in System Settings ➔ User Management panel. |
| **AI Quotation Parsing Fails** | Invalid or missing `GEMINI_API_KEY` | Ensure `GEMINI_API_KEY` is exported in the environment. |
| **Data Reset on Restart** | Volume not mounted in Docker | Ensure `-v pos_db_data:/app/data` is included in docker run command. |

---

*Documentation maintained by Head Office IT & Administration Team.*
