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

4. **Install PHP dependencies, generate app key, link storage, and seed the database:**

    ```bash
    docker compose exec app composer install
    docker compose exec app php artisan key:generate
    docker compose exec app php artisan storage:link
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
