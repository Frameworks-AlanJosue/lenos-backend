# ───────────────────────────────────────────────────────────
# FASE 1: Build (Compilación)
# ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# ───────────────────────────────────────────────────────────
# FASE 2: Runtime (Ejecución)
# ───────────────────────────────────────────────────────────
FROM node:20-alpine

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copiar dependencias de la fase builder
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodeuser:nodejs . .

# Exponer puerto (solo internamente, no mapeado al host)
EXPOSE 3000

# Cambiar a usuario no-root
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Comando de inicio
CMD ["node", "src/index.js"]
