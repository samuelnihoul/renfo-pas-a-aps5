#!/bin/sh
# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h db-primary -U samuelnihoul; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run the database push
echo "Running database migrations..."
pnpm run db:push

# Start the application
echo "Starting application..."
exec pnpm next start