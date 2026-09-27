FROM php:8.2-cli-alpine
WORKDIR /var/www

# Install PostgreSQL & SQLite PDO extensions
RUN apk add --no-cache postgresql-dev sqlite-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_sqlite

# Copy backend application, database schema, and built frontend
COPY backend/ ./backend/
COPY database/ ./database/
COPY artifacts/animora-studio-library/dist/public ./artifacts/animora-studio-library/dist/public

ENV PORT=8080
ENV BASE_PATH=/animora-api
EXPOSE 8080

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} backend/public/router.php"]
