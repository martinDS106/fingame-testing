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

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "set -e; echo '[boot] pwd:'; pwd; echo '[boot] ls:'; ls -la; echo '[boot] ls dist:'; ls -la dist || true; echo '[boot] ensure build'; npm run build; echo '[boot] migrate'; npx prisma migrate deploy; if [ -f dist/main.js ]; then echo '[boot] start dist/main.js'; node dist/main.js; elif [ -f dist/main ]; then echo '[boot] start dist/main'; node dist/main; elif [ -f dist/src/main.js ]; then echo '[boot] start dist/src/main.js'; node dist/src/main.js; else echo '[boot] ERROR: cannot find built entrypoint'; echo '[boot] dist contents:'; ls -R dist || true; exit 1; fi"]

