# ===================================================================
# Multi-Stage Production Dockerfile for SENTORA
# Lightweight, Fast & Free of Ollama / Heavy GPU Dependencies
# ===================================================================

# -------------------------------------------------------------
# Stage 1: Build React Frontend (Vite + TypeScript)
# -------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Build Express Backend (Node.js + TypeScript)
# -------------------------------------------------------------
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 3: Lightweight Production Runner (~120MB Image)
# -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy backend dependencies and install production-only modules
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy built frontend assets (served statically by Express)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Non-root user for security
USER node

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/dist/server.js"]
