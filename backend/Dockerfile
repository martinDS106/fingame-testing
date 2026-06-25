FROM node:22-slim

WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Railway uses repo root as build context, even when Dockerfile lives in backend/.
# So we must copy files with the backend/ prefix.
COPY backend/package.json backend/package-lock.json ./
# Don't run package scripts during install (our repo has a postinstall that
# requires source files, which aren't copied yet in this layer).
RUN npm ci --include=dev --ignore-scripts

COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/nest-cli.json backend/tsconfig.json backend/tsconfig.build.json backend/prisma.config.ts ./
COPY supabase/seeds.sql /app/supabase/seeds.sql

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
EXPOSE 3001

# Nest build output is dist/main.js. Seed fills Course/Quiz rows on fresh MySQL (upsert).
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && node dist/main.js"]

