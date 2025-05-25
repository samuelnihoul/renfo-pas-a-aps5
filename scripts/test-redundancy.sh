#!/bin/bash

# Test script for redundancy implementation
echo "Testing redundancy implementation..."

# Start the redundant system
echo "Starting redundant system..."
docker-compose -f docker-compose.redundant.yml up -d

# Wait for the system to start
echo "Waiting for the system to start..."
sleep 30

# Test 1: Verify all services are running
echo "Test 1: Verifying all services are running..."
docker-compose -f docker-compose.redundant.yml ps

# Test 2: Test the application
echo "Test 2: Testing the application..."
curl -s http://localhost:80 > /dev/null
if [ $? -eq 0 ]; then
    echo "Application is accessible"
else
    echo "Application is not accessible"
    exit 1
fi

# Test 3: Simulate failure of one application instance
echo "Test 3: Simulating failure of one application instance..."
APP_CONTAINER=$(docker ps | grep renfo-pas-a-aps5_app | head -n 1 | awk '{print $1}')
docker stop $APP_CONTAINER

# Wait for the system to recover
echo "Waiting for the system to recover..."
sleep 10

# Verify the application is still accessible
echo "Verifying the application is still accessible..."
curl -s http://localhost:80 > /dev/null
if [ $? -eq 0 ]; then
    echo "Application is still accessible after instance failure"
else
    echo "Application is not accessible after instance failure"
    exit 1
fi

# Test 4: Simulate failure of the primary database
echo "Test 4: Simulating failure of the primary database..."
docker-compose -f docker-compose.redundant.yml stop db-primary

# Wait for the system to recover
echo "Waiting for the system to recover..."
sleep 30

# Verify the application is still accessible
echo "Verifying the application is still accessible..."
curl -s http://localhost:80 > /dev/null
if [ $? -eq 0 ]; then
    echo "Application is still accessible after primary database failure"
else
    echo "Application is not accessible after primary database failure"
    exit 1
fi

# Clean up
echo "Cleaning up..."
docker-compose -f docker-compose.redundant.yml down

echo "Redundancy test completed successfully!"