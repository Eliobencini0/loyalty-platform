# Single image: Express API that also serves the built dashboard (/dashboard)
# and the static customer pages (/app/*). Runs via ts-node (same as dev) to
# avoid a separate tsc build step.
FROM node:22-alpine

# Prisma needs openssl at runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Backend deps (lockfile is in sync)
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client (schema only — cheap layer, cached unless schema changes)
COPY prisma ./prisma
RUN npx prisma generate

# App source
COPY . .

# Build the merchant dashboard (Vite). --legacy-peer-deps: vite-plugin-pwa vs Vite 8
RUN cd dashboard && npm ci --legacy-peer-deps && npm run build

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Apply migrations on boot, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node src/index.ts"]
