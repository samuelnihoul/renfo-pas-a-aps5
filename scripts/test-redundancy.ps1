# Test script for redundancy implementation
Write-Host "Testing redundancy implementation..."

# Start the redundant system
Write-Host "Starting redundant system..."
docker-compose -f docker-compose.redundant.yml up -d

# Wait for the system to start
Write-Host "Waiting for the system to start..."
Start-Sleep -Seconds 30

# Test 1: Verify all services are running
Write-Host "Test 1: Verifying all services are running..."
docker-compose -f docker-compose.redundant.yml ps

# Test 2: Test the application
Write-Host "Test 2: Testing the application..."
try {
    Invoke-WebRequest -Uri "http://localhost:80" -Method Head -ErrorAction Stop | Out-Null
    Write-Host "Application is accessible"
} catch {
    Write-Host "Application is not accessible"
    exit 1
}

# Test 3: Simulate failure of one application instance
Write-Host "Test 3: Simulating failure of one application instance..."
$APP_CONTAINER = (docker ps | Select-String "renfo-pas-a-aps5_app" | Select-Object -First 1).ToString().Split()[0]
docker stop $APP_CONTAINER

# Wait for the system to recover
Write-Host "Waiting for the system to recover..."
Start-Sleep -Seconds 10

# Verify the application is still accessible
Write-Host "Verifying the application is still accessible..."
try {
    Invoke-WebRequest -Uri "http://localhost:80" -Method Head -ErrorAction Stop | Out-Null
    Write-Host "Application is still accessible after instance failure"
} catch {
    Write-Host "Application is not accessible after instance failure"
    exit 1
}

# Test 4: Simulate failure of the primary database
Write-Host "Test 4: Simulating failure of the primary database..."
docker-compose -f docker-compose.redundant.yml stop db-primary

# Wait for the system to recover
Write-Host "Waiting for the system to recover..."
Start-Sleep -Seconds 30

# Verify the application is still accessible
Write-Host "Verifying the application is still accessible..."
try {
    Invoke-WebRequest -Uri "http://localhost:80" -Method Head -ErrorAction Stop | Out-Null
    Write-Host "Application is still accessible after primary database failure"
} catch {
    Write-Host "Application is not accessible after primary database failure"
    exit 1
}

# Clean up
Write-Host "Cleaning up..."
docker-compose -f docker-compose.redundant.yml down

Write-Host "Redundancy test completed successfully!"