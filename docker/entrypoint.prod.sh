#!/bin/sh
set -e

echo "==> Running GeoReport production bootstrap..."

# Wait for database to become reachable if DB_HOST is set
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database at $DB_HOST:${DB_PORT:-3306}..."
    timeout=60
    while ! nc -z "$DB_HOST" "${DB_PORT:-3306}" 2>/dev/null; do
        timeout=$((timeout - 1))
        if [ "$timeout" -le 0 ]; then
            echo "Warning: Database connection timed out, continuing anyway..."
            break
        fi
        sleep 1
    done
fi

# Ensure storage link exists
php artisan storage:link --force || true

# Run database migrations and seeders if enabled
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || true
fi

# Cache configuration, routes, and views for high performance in production
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "Caching Laravel configuration, routes, and views..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "==> Starting PHP-FPM..."
exec "$@"
