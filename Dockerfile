# Stage 1: Build the React Frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY artifacts/animora-studio-library/package.json ./artifacts/animora-studio-library/
COPY lib/ ./lib/
COPY scripts/ ./scripts/

# Install dependencies (skipping ignored builds check for container)
RUN pnpm install --config.ignore-scripts=true

COPY artifacts/animora-studio-library/ ./artifacts/animora-studio-library/
RUN pnpm --filter @workspace/animora-studio-library run build

# Stage 2: Production PHP Runtime
FROM php:8.2-cli-alpine
WORKDIR /var/www

# Install PostgreSQL & SQLite PDO extensions
RUN apk add --no-cache postgresql-dev sqlite-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_sqlite

# Copy backend application and database schema
COPY backend/ ./backend/
COPY database/ ./database/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/artifacts/animora-studio-library/dist/public ./artifacts/animora-studio-library/dist/public

ENV PORT=8080
ENV BASE_PATH=/animora-api
EXPOSE 8080

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} backend/public/router.php"]
