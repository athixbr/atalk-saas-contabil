# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
# Instala dependências, compila TypeScript e migrations
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Ferramentas para compilar módulos nativos (sharp, bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Instala dependências primeiro (cache de layer)
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copia o restante do código
COPY . .

# Compila o projeto principal (src/ → dist/src/)
RUN npm run build

# Compila as migrations separadamente (src/database/migrations/ → dist/database/migrations/)
# necessário porque o .sequelizerc aponta para dist/database/migrations/
RUN npx tsc -p tsconfig.migrations.json

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production
# Imagem final enxuta com apenas o necessário para rodar
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bullseye-slim

WORKDIR /app

# Runtime: ffmpeg (mídia) + Chromium (Puppeteer/WWebJS adapter)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    ca-certificates \
    fonts-liberation \
    fonts-freefont-ttf \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Copia artefatos do builder
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .sequelizerc docker-entrypoint.sh ./

# Diretório de uploads — montar como volume no Coolify
# Caminho interno: /app/public
RUN mkdir -p public logs \
    && chmod +x docker-entrypoint.sh

# Não baixar Chromium do npm — usa o do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

EXPOSE 4000

# Health check via TCP na porta do servidor
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "\
      const n = require('net'); \
      const c = n.createConnection(+process.env.PORT || 4000, 'localhost'); \
      c.on('connect', () => { c.destroy(); process.exit(0); }); \
      c.on('error', () => process.exit(1));"

# Roda migrations e inicia o servidor
ENTRYPOINT ["./docker-entrypoint.sh"]
