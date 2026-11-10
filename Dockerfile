# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend + Static Frontend
FROM node:22-alpine AS production
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=5002
ENV SERVE_FRONTEND=true

COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

RUN mkdir -p /app/backend/uploads && chown -R node:node /app
USER node

EXPOSE 5002
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5002/api/health || exit 1

CMD ["node", "src/server.js"]

