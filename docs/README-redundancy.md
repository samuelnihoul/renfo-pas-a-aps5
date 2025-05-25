# Redundancy Implementation for Renfo Pas à Pas

This directory contains the configuration files and documentation for implementing redundancy and fault-resilience in the Renfo Pas à Pas application.

## Quick Start

1. **Prepare the Configuration Files**:
   - All necessary configuration files are included in the repository:
     - `nginx/nginx.conf`: NGINX load balancer configuration
     - `db/postgresql.conf`: PostgreSQL primary server configuration
     - `db/postgresql.replica.conf`: PostgreSQL replica server configuration
     - `docker-compose.redundant.yml`: Docker Compose configuration for the redundant system

2. **Start the Redundant System**:
   ```powershell
   docker-compose -f docker-compose.redundant.yml up -d
   ```

3. **Test the Redundancy Implementation**:
   ```powershell
   scripts\test-redundancy.ps1
   ```

## Documentation

For detailed information about the redundancy implementation, please refer to the [redundancy.md](redundancy.md) file, which includes:

- Overview of the redundancy architecture
- Implementation details for application, database, and storage redundancy
- Docker Compose configuration
- NGINX and PostgreSQL configuration
- Deployment instructions
- Testing procedures
- Monitoring and maintenance recommendations

## Files

- `redundancy.md`: Detailed documentation for the redundancy implementation
- `../docker-compose.redundant.yml`: Docker Compose configuration for the redundant system
- `../nginx/nginx.conf`: NGINX load balancer configuration
- `../db/postgresql.conf`: PostgreSQL primary server configuration
- `../db/postgresql.replica.conf`: PostgreSQL replica server configuration
- `../scripts/test-redundancy.sh`: Bash script for testing the redundancy implementation
- `../scripts/test-redundancy.ps1`: PowerShell script for testing the redundancy implementation

## Support

If you encounter any issues with the redundancy implementation, please contact the development team.