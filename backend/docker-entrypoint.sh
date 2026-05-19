#!/bin/sh
set -e

echo "──────────────────────────────────────"
echo " ATalk Backend — iniciando"
echo "──────────────────────────────────────"

echo "▶  Executando migrations..."
npx sequelize db:migrate

echo "▶  Iniciando servidor na porta ${PORT:-4000}..."
exec node dist/src/server.js
