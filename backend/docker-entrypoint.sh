#!/bin/bash
set -e

# Run migrations
php artisan migrate --force

# Seed database only if APP_ENV is production and SEED_ON_DEPLOY is true
if [ "$SEED_ON_DEPLOY" = "true" ]; then
    echo "Seeding database..."
    php artisan db:seed --class=ComprehensiveSeeder --force
    echo "Database seeded successfully!"
fi

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the application
exec "$@"
