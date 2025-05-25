FROM postgres:16

# Environment variables for PostgreSQL
ENV POSTGRES_USER=samuelnihoul
ENV POSTGRES_PASSWORD=aoethns24teuTT!@
ENV POSTGRES_DB=renfo-pas-a-pas

# Expose the PostgreSQL port
EXPOSE 5432

# Add a health check
HEALTHCHECK --interval=5s --timeout=5s --retries=3 CMD pg_isready -U samuelnihoul -d renfo-pas-a-pas || exit 1