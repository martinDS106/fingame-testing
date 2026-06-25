FROM node:22-slim AS backend_deps
WORKDIR /app/backend

# Prisma needs OpenSSL at runtime; keep it available in both build + runtime layers.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
# postinstall runs prisma/nest before sources are copied — skip until build stage
RUN npm ci --include=dev --ignore-scripts

FROM node:22-slim AS backend_build
WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=backend_deps /app/backend/node_modules ./node_modules
COPY backend/ ./

RUN npm run prisma:generate && npm run build

FROM node:22-slim AS backend_runtime
WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=backend_build /app/backend/node_modules ./node_modules
COPY --from=backend_build /app/backend/dist ./dist
COPY --from=backend_build /app/backend/prisma ./prisma
COPY --from=backend_build /app/backend/package.json ./package.json

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

