FROM node:22-alpine AS builder
WORKDIR /app
 
COPY package*.json tsconfig.json ./
RUN npm ci
 
COPY app.ts ./
COPY app/   ./app/
 
RUN npx tsc --outDir dist
 
# Runtime
FROM node:22-alpine AS runner
WORKDIR /app
 
# Usuario sin privilegios
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 
# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev
 
# Trae el build compilado del stage anterior
COPY --from=builder /app/dist ./dist
 
# Directorio de uploads (montado como volumen en compose)
RUN mkdir -p uploads && chown -R appuser:appgroup /app
 
USER appuser
 
EXPOSE 3000
 
CMD ["node", "dist/app.js"]