#!/bin/bash
set -e

# Create SQLite database if it doesn't exist
if [ ! -f /var/data/database/database.sqlite ]; then
    touch /var/data/database/database.sqlite
    echo "Created new SQLite database"
fi

# Run migrations
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the application
exec "$@"
