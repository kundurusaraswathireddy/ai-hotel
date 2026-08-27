# ==========================================
# Stage 1: Build React/Vite Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
# Build frontend static assets into /app/frontend/dist
RUN npm run build

# ==========================================
# Stage 2: Production Python ML Runtime
# ==========================================
FROM python:3.11-slim AS production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend code, Trained ML models, and Data
COPY backend/ ./backend/
COPY models/ ./models/
COPY data/ ./data/

# Copy compiled frontend from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set Python path and environment defaults
ENV PYTHONPATH=/app
ENV HOST=0.0.0.0

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]