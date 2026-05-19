# Build gerado localmente e commitado no repositório.
# O Coolify apenas copia os arquivos e inicia o servidor Express.
FROM node:20-alpine

WORKDIR /app

# Instala apenas o Express (única dependência de runtime)
RUN npm install express

# Copia o build estático e o servidor
COPY build ./build
COPY docker-server.js ./

ENV SERVER_PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e "\
      const h = require('http'); \
      h.get('http://localhost:' + (process.env.SERVER_PORT || 3000), r => \
        process.exit(r.statusCode < 500 ? 0 : 1) \
      ).on('error', () => process.exit(1));"

CMD ["node", "docker-server.js"]
