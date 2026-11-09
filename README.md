# GeoReport — Municipality of Loon, Province of Bohol

**GeoReport** is a GIS-enabled municipal public service and citizen concern management platform built for the **Municipality of Loon, Province of Bohol, Philippines** (`loon.gov.ph`). It connects Loon residents, field engineering staff, and municipal administrators on a unified OpenStreetMap workspace covering all **67 official PSGC barangays**.

---

## Key Features

- **Role-Based Workspaces:**
    - **Citizen Portal:** Submit geotagged infrastructure and community concerns with photo evidence, select from all 67 Loon barangays, view approved community reports on OpenStreetMap, and track real-time case timelines and notifications.
    - **Field Staff Portal:** View assigned field dispatches on an interactive OpenStreetMap route map, start on-site investigations, post internal or public case notes, and upload resolution photo proof.
    - **Administrator Portal:** Triage incoming reports (single or bulk approve/reject), assign field staff, verify resolutions and close cases, inspect all 67 official NAMRIA/PSA barangay boundary polygons (`EPSG:4326`), manage categories, barangays, user roles, and municipal analytics.
- **Interactive Municipal GIS (`OpenStreetMap` + `Leaflet`):**
    - Serves Loon's 67 official barangay boundary polygons (`storage/app/geojson/loon_bohol.geojson`, PSGC `PH0701230`) on Administrator GIS views while keeping Citizen and Field Staff maps clean and focused on pin locations.
- **Mobile-Responsive GovTech UI:**
    - Collapsible drawer navigation, stacked card queues on phones/tablets, scrollable modals, and native mobile camera/gallery photo uploads.

---

## Tech Stack

- **Backend:** PHP 8.4, Laravel 13, Laravel Fortify, Spatie Laravel Permission
- **Frontend:** Vue 3 (`<script setup lang="ts">`), Inertia.js v3, Tailwind CSS v4, Reka UI / shadcn-vue, Lucide Icons
- **Mapping & GIS:** Leaflet 1.9, OpenStreetMap tiles, NAMRIA / PSA (2023) Barangay Boundary GeoJSON
- **Infrastructure:** Docker Compose (`php:8.4-fpm`, `nginx:alpine`, `mysql:8.4`, `node:22-alpine`)

---

## Quick Start (Docker + WSL / Linux / macOS)

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Dwennie/GeoReport.git
    cd GeoReport
    ```

2. **Configure environment variables:**

    ```bash
    cp .env.example .env
    ```

    Open `.env` and switch the database section to the Docker MySQL service:

    ```env
    DB_CONNECTION=mysql
    DB_HOST=db
    DB_PORT=3306
    DB_DATABASE=georeport
    DB_USERNAME=georeport
    DB_PASSWORD=georeportpassword
    ```

3. **Start the containers:**

    ```bash
    docker compose up -d --build app nginx db
    ```

4. **Install PHP dependencies, generate app key, link storage, generate route types, and seed the database:**

    ```bash
    docker compose exec app composer install
    docker compose exec app php artisan key:generate
    docker compose exec app php artisan storage:link
    docker compose exec app php artisan wayfinder:generate --with-form
    docker compose exec app php artisan migrate --seed
    ```

5. **Build frontend production assets:**

    ```bash
    docker compose run --rm node sh -c "npm install && npm run build"
    ```

6. **Open the portal:**
   Visit [http://localhost:8000](http://localhost:8000)

---

## Default Seeded Administrator Account

Running `php artisan migrate --seed` seeds all 67 Loon barangays, default municipal complaint categories, role permissions, and the initial administrator account:

| Role              | Email                  | Password   |
| ----------------- | ---------------------- | ---------- |
| **Administrator** | `admin@georeport.test` | `password` |

Citizens can register directly at `/register`, and the Administrator can promote accounts to **Field Staff** or **Administrator** under **Admin → Users**.

---

## Windows Desktop App (`GeoReport.exe` via Tauri v2)

GeoReport includes a lightweight Rust + Tauri v2 Windows desktop client (`src-tauri/` + `desktop/`) branded with the official **Municipality of Loon** seal. It connects directly to your running Docker server (`http://localhost:8000` or a host LAN IP such as `http://192.168.1.x:8000`) so all reports, GIS pins, role changes, and photo uploads share the live Docker MySQL (`georeport`) database in real time.

### Option A: Download Prebuilt `GeoReport.exe` (GitHub Actions)

1. Open the **Actions** tab on GitHub and select **Build Windows Desktop EXE (Tauri)**.
2. Open the latest completed workflow run and download **`GeoReport-Portable-EXE`** (single standalone `GeoReport.exe`, no installer required) or **`GeoReport-Windows-Setup`** (optional NSIS installer).
3. Make sure your Docker stack is running (`docker compose up -d`), then launch **`GeoReport.exe`**.

### Option B: Build Locally on Windows

Requires [Rust](https://rustup.rs/), Visual Studio C++ Build Tools, and Node.js 22+:

```powershell
npx @tauri-apps/cli@2 build
```

The standalone portable executable is output to `src-tauri/target/release/GeoReport.exe`.

---

## Cloud Production Deployment (Running 24/7 Without Your Laptop)

To keep GeoReport running 24/7 with MySQL in the cloud so anyone (browser or Windows `GeoReport.exe`) can connect without keeping your laptop on:

### Option 1: Any Cloud VPS (DigitalOcean, Hetzner, AWS Lightsail, Linode) — Recommended

Deploy on any $4–$6/month Linux VPS:

1. **Clone the `prod` branch on your server:**

    ```bash
    git clone -b prod https://github.com/Dwennie/GeoReport.git
    cd GeoReport
    ```

2. **Configure production environment:**

    ```bash
    cp .env.production.example .env
    # Generate an application encryption key
    docker run --rm -v $(pwd):/app -w /app composer:2 composer install --no-dev
    docker run --rm -v $(pwd):/app -w /app php:8.4-cli php artisan key:generate
    ```

    Edit `.env` to set your server's domain/IP and strong database passwords.

3. **Launch the production stack:**
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```
    The production image automatically runs database migrations, links public storage, builds optimized Vite assets, pre-warms OPcache, and configures Nginx caching.

### Option 2: Managed PaaS (Coolify, Railway, or Render)

- **Coolify (Self-hosted Heroku on VPS):** Connect your GitHub repository, choose the `prod` branch, and select `docker-compose.prod.yml`.
- **Railway / Render:** Connect the repository, add a MySQL service, set environment variables from `.env.production.example`, and deploy using `Dockerfile.prod`.

---

## Security & Rate Limiting Architecture

GeoReport implements enterprise-grade defense-in-depth:

- **Tiered Rate Limiting:**
    - `web`: Baseline protection (240 req/min authenticated, 300 req/min unauthenticated).
    - `report-submissions`: Throttles citizen report creation to 5/minute and 30/hour per user/IP.
    - `workspace-actions`: Throttles state mutations (status updates, case notes, assignments, user edits) to 30 req/min for staff/citizens and 90 req/min for admins.
    - `fortify`: Strict rate limits on user registration (5/min, 20/hr), password resets (3/min, 5/hr per email), and password changes (6/min).
    - `geojson`: Throttles public boundary GeoJSON queries to 60 req/min.
    - **Inertia Toast Error Handling:** Rate limit (HTTP 429) triggers a user-friendly toast informing them of the exact cooldown seconds rather than displaying a raw error page.
- **Security Headers Middleware:** Emits `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, restrictive `Permissions-Policy`, and strips `X-Powered-By`.
- **Reverse Proxy Protection (`TrustProxies`):** Configurable `TRUSTED_PROXIES` ensures `X-Forwarded-For` spoofing cannot bypass rate limiters behind Cloudflare, Caddy, or PaaS load balancers.
- **Mid-Session Deactivation Enforcement:** `EnsureAccountIsActive` immediately logs out accounts marked inactive by administrators and invalidates their session.
- **Data Leakage Prevention:** Internal staff notes are excluded at the API/transformer layer when rendering public community reports for citizens.
- **File Upload Safeguards:** Enforces strict image MIME types (`jpg, jpeg, png, webp, gif`), maximum file size (10 MB), and maximum photo count matching `PlatformSettings::maxPhotos()`.

---

## Quality Checks & Testing

```bash
# PHP code style (Laravel Pint)
./vendor/bin/pint --test

# Static analysis (Larastan / PHPStan Level 7)
./vendor/bin/phpstan analyse

# Frontend formatting, linting, and TypeScript checks
npm run check
npm run types:check

# Production bundle build
npm run build

# Automated Pest test suite
php artisan test
```
