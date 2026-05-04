FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Don't run package scripts during install (our repo has a postinstall that
# requires source files, which aren't copied yet in this layer).
RUN npm ci --include=dev --ignore-scripts

COPY prisma ./prisma
COPY src ./src
COPY nest-cli.json tsconfig.json tsconfig.build.json prisma.config.ts ./

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

