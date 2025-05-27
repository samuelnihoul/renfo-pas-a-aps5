#!/bin/sh
# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h db-primary -U samuelnihoul; do
  sleep 1
done
echo "PostgreSQL is ready!"
# Create database if it doesn't exist
echo "Ensuring database exists..."
PGPASSWORD=aoethns24teuTT!@ psql -h db-primary -U samuelnihoul -c "SELECT 1 FROM pg_database WHERE datname = 'renfo_pas_a_pas'" | grep -q 1 || PGPASSWORD=aoethns24teuTT!@ psql -h db-primary -U samuelnihoul -c "CREATE DATABASE renfo_pas_a_pas"

# Run the database push
echo "Running database migrations..."
pnpm run db:push

# Start the application
echo "Starting application..."
exec pnpm run start