FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY app.ts ./
COPY app/   ./app/

RUN npx tsc --outDir dist

FROM node:22-alpine AS dev
WORKDIR /app

RUN apk add --no-cache postgresql-client   # ← agrega psql y pg_restore

COPY package*.json tsconfig.json ./
RUN npm ci
EXPOSE 3000
CMD ["npx", "nodemon", "app.ts"]

FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000
CMD ["node", "dist/app.js"]