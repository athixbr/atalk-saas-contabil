#!/bin/bash
# setup/setup-db.sh
# Cria o usuário e banco no PostgreSQL, executa migrations e popula dados iniciais.
# Execute a partir da raiz do projeto: bash setup/setup-db.sh
set -e

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; N='\033[0m'

step() { echo -e "\n${B}▶  $1${N}"; }
ok()   { echo -e "${G}✓  $1${N}"; }
warn() { echo -e "${Y}⚠  $1${N}"; }
err()  { echo -e "${R}❌  $1${N}"; exit 1; }

echo ""
echo -e "${B}╔══════════════════════════════════════╗${N}"
echo -e "${B}║   ATALK — SETUP DO BANCO DE DADOS    ║${N}"
echo -e "${B}╚══════════════════════════════════════╝${N}"

# ─── Verifica .env ────────────────────────────────────────────────────────────
step "Verificando .env"
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    warn ".env não encontrado. Copiando .env.example → .env"
    cp .env.example .env
    warn "Edite o .env com suas credenciais e execute novamente."
    exit 1
  else
    err ".env não encontrado. Crie o arquivo antes de continuar."
  fi
fi
ok ".env encontrado"

# ─── Carrega variáveis ────────────────────────────────────────────────────────
set -a
# shellcheck disable=SC1091
source .env
set +a

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-atalk}"
DB_USER="${DB_USER:-atalk}"
DB_PASS="${DB_PASS:-atalk}"

echo ""
echo "  Host   : $DB_HOST:$DB_PORT"
echo "  Banco  : $DB_NAME"
echo "  Usuário: $DB_USER"

# ─── Cria usuário e banco no PostgreSQL ──────────────────────────────────────
step "Criando usuário e banco de dados no PostgreSQL"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE "${DB_USER}" LOGIN PASSWORD '${DB_PASS}';
    RAISE NOTICE 'Usuário ${DB_USER} criado.';
  ELSE
    ALTER ROLE "${DB_USER}" WITH PASSWORD '${DB_PASS}';
    RAISE NOTICE 'Usuário ${DB_USER} já existe — senha atualizada.';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE "${DB_NAME}"
  OWNER "${DB_USER}"
  ENCODING ''UTF8''
  TEMPLATE template0'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = '${DB_NAME}'
)
\gexec

GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";
SQL

ok "Banco de dados pronto"

# ─── Instala dependências ────────────────────────────────────────────────────
step "Instalando dependências npm"
npm install --legacy-peer-deps
ok "Dependências instaladas"

# ─── Build TypeScript ─────────────────────────────────────────────────────────
step "Compilando TypeScript"
npm run build
ok "Build concluído"

# ─── Executa migrations ───────────────────────────────────────────────────────
step "Executando migrations (cria todas as tabelas)"
npx sequelize db:migrate
ok "Migrations executadas"

# ─── Dados iniciais ───────────────────────────────────────────────────────────
step "Inserindo dados iniciais (empresa + superadmin)"
node setup/seed-initial.cjs

echo ""
echo -e "${G}╔══════════════════════════════════════╗${N}"
echo -e "${G}║          TUDO PRONTO! ✓              ║${N}"
echo -e "${G}╚══════════════════════════════════════╝${N}"
echo ""
echo "  Iniciar em desenvolvimento : npm run dev"
echo "  Iniciar em produção        : npm start"
echo "  Iniciar com PM2            : pm2 start ecosystem.config.js"
echo ""
