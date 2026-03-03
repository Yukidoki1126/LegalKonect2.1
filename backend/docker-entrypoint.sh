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

# Clear and rebuild caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the application
exec "$@"
