# Renfo Pas à Pas

A comprehensive fitness tracking application that helps users follow workout programs, track their progress, and manage their exercise routines.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Containerization**: Docker and Docker Compose
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form with Zod validation

## Features

- User authentication and profile management
- Workout program creation and management
- Exercise library with video demonstrations
- Routine tracking and progress monitoring
- Favorites system for quick access to preferred exercises
- Admin dashboard for content management

## Database Schema

The application uses a PostgreSQL database with the following main tables:
- **programs**: Workout programs with difficulty levels and durations
- **users**: User accounts and authentication information
- **exercises**: Exercise details including video demonstrations
- **routines**: Daily workout routines within programs
- **block**: Exercise blocks within routines
- **userProgress**: Tracking user workout completion
- **favorites**: User's favorite exercises

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm package manager
- PostgreSQL (if running without Docker)
- Docker and Docker Compose (for containerized setup)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgres://username:password@localhost:5432/renfo_pas_a_pas
```

### Installation and Setup

#### Without Docker

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Set up the database:
   ```
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```
4. Run the development server:
   ```
   pnpm dev
   ```

#### With Docker

1. Clone the repository
2. Build and start the containers:
   ```
   docker-compose up -d
   ```
3. The application will be available at http://localhost:3000

## Development Commands

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint
- `pnpm studio`: Start Drizzle Studio for database management
- `pnpm db:generate`: Generate database migrations
- `pnpm db:push`: Push schema changes to the database
- `pnpm db:seed`: Populate the database with initial sample data

## Docker Commands

- `docker-compose up -d`: Start all services in detached mode
- `docker-compose down`: Stop all services
- `docker-compose logs`: View logs from all services
- `docker-compose ps`: List running services

## Redundancy and Fault-Resilience

The application supports a redundant deployment configuration for high availability and fault tolerance:

- **Multiple Application Instances**: Load balanced using NGINX
- **Database Replication**: Primary-replica setup for PostgreSQL
- **Shared Storage**: For video files and other static assets

### Redundant Deployment

To deploy the application with redundancy:

```powershell
docker-compose -f docker-compose.redundant.yml up -d
```

### Testing Redundancy

A test script is provided to verify the redundancy implementation:

```powershell
scripts\test-redundancy.ps1
```

For detailed information about the redundancy implementation, refer to the documentation in the `docs` directory:
- [Redundancy Documentation](docs/redundancy.md)
- [Redundancy README](docs/README-redundancy.md)

## Project Structure

- `/app`: Next.js application routes and pages
- `/components`: React components
- `/db`: Database schema and connection setup
- `/public`: Static assets
- `/styles`: Global CSS styles

## License

This project is licensed under the MIT License.
