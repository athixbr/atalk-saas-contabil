# ATalk Backend — SaaS Contábil

Backend do sistema ATalk para escritórios de contabilidade. Construído com Node.js, TypeScript, Express, PostgreSQL, Redis e integração WhatsApp via Baileys.

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração do .env](#configuração-do-env)
- [Setup do banco de dados](#setup-do-banco-de-dados)
- [Executando o servidor](#executando-o-servidor)
- [Produção com PM2](#produção-com-pm2)
- [Variáveis de ambiente — referência completa](#variáveis-de-ambiente--referência-completa)

---

## Pré-requisitos

| Dependência | Versão mínima | Observação |
|---|---|---|
| Node.js | 20.x | Recomendado via [nvm](https://github.com/nvm-sh/nvm) |
| npm | 9+ | Já vem com o Node |
| PostgreSQL | 15+ | Testado com 17 |
| Redis | 6+ | Porta padrão 6379 |
| ffmpeg | qualquer | Processamento de áudio/vídeo |

### Instalando dependências do sistema (Ubuntu 22.04 / 24.04)

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 17
sudo apt-get install -y curl ca-certificates
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list'
sudo apt-get update
sudo apt-get install -y postgresql-17

# Redis
sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# ffmpeg
sudo apt-get install -y ffmpeg
```

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/athixbr/atalk-backend-saas-contabil.git
cd atalk-backend-saas-contabil
```

### 2. Configure o .env

```bash
cp .env.example .env
nano .env  # edite com suas configurações
```

Variáveis obrigatórias para começar:

```env
BACKEND_URL=https://api.seudominio.com.br
FRONTEND_URL=https://app.seudominio.com.br
PORT=4000

JWT_SECRET=uma_string_aleatoria_longa_aqui
JWT_REFRESH_SECRET=outra_string_aleatoria_aqui

DB_HOST=localhost
DB_PORT=5432
DB_NAME=atalk
DB_USER=atalk
DB_PASS=sua_senha_aqui

REDIS_URI=redis://127.0.0.1:6379
```

> Gere strings seguras para JWT com: `openssl rand -hex 32`

### 3. Execute o setup completo

```bash
bash setup/setup-db.sh
```

Este script vai:
1. Criar o usuário e banco de dados no PostgreSQL
2. Instalar as dependências npm
3. Compilar o TypeScript
4. Executar todas as migrations (cria as tabelas)
5. Solicitar nome da empresa, e-mail e senha do administrador
6. Inserir os dados iniciais

---

## Configuração do .env

Copie `.env.example` para `.env` e preencha as variáveis. Veja a [referência completa](#variáveis-de-ambiente--referência-completa) abaixo.

---

## Setup do banco de dados

### Setup automático (recomendado)

```bash
bash setup/setup-db.sh
```

### Passo a passo manual

```bash
# 1. Criar usuário e banco no PostgreSQL
sudo -u postgres psql -c "CREATE ROLE atalk LOGIN PASSWORD 'sua_senha';"
sudo -u postgres psql -c "CREATE DATABASE atalk OWNER atalk ENCODING 'UTF8' TEMPLATE template0;"

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Compilar TypeScript
npm run build

# 4. Executar migrations
npx sequelize db:migrate

# 5. Inserir dados iniciais (empresa + superadmin)
node setup/seed-initial.cjs
```

### Modo não-interativo (Docker / CI)

O seed aceita variáveis de ambiente para rodar sem prompts:

```bash
SETUP_COMPANY_NAME="Meu Escritório" \
SETUP_ADMIN_NAME="Admin" \
SETUP_ADMIN_EMAIL="admin@meuescritorio.com.br" \
SETUP_ADMIN_PASSWORD="minhasenha123" \
node setup/seed-initial.cjs
```

---

## Executando o servidor

### Desenvolvimento

```bash
npm run dev
```

O servidor reinicia automaticamente ao salvar arquivos (ts-node-dev).

### Produção

```bash
npm run build
npm start
```

---

## Produção com PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs atalk-backend

# Reiniciar
pm2 restart atalk-backend

# Ativar inicialização automática no boot
pm2 startup
pm2 save
```

---

## Variáveis de ambiente — referência completa

### Servidor

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `NODE_ENV` | Não | — | `production` ou `development` |
| `PORT` | Sim | — | Porta HTTP do backend |
| `BACKEND_URL` | Sim | — | URL pública do backend (com `https://`) |
| `FRONTEND_URL` | Sim | — | URL pública do frontend (usada no CORS) |
| `PROXY_PORT` | Não | — | Porta do proxy reverso (ex: 443) |

### JWT

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Segredo para assinar tokens de acesso |
| `JWT_REFRESH_SECRET` | Sim | Segredo para assinar tokens de refresh |

> Gere com: `openssl rand -hex 32`

### Banco de dados (PostgreSQL)

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_DIALECT` | `postgres` | Dialeto do banco (não altere) |
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | — | Nome do banco de dados |
| `DB_USER` | — | Usuário do banco |
| `DB_PASS` | — | Senha do usuário |
| `DB_TIMEZONE` | `-03:00` | Fuso horário das queries |
| `DB_DEBUG` | `false` | Loga todas as queries SQL se `true` |

### Redis

| Variável | Padrão | Descrição |
|---|---|---|
| `REDIS_URI` | — | URI de conexão (ex: `redis://127.0.0.1:6379`) |
| `REDIS_OPT_LIMITER_MAX` | `1` | Limite de jobs simultâneos nas filas |
| `REDIS_OPT_LIMITER_DURATION` | `3000` | Duração da janela do limiter (ms) |

### Limites do sistema

| Variável | Padrão | Descrição |
|---|---|---|
| `USER_LIMIT` | `100` | Máximo de usuários por empresa |
| `CONNECTIONS_LIMIT` | `10` | Máximo de conexões WhatsApp por empresa |
| `CLOSED_SEND_BY_ME` | `true` | Permite envio em tickets fechados pelo próprio usuário |

### Monitoramento (opcional)

| Variável | Descrição |
|---|---|
| `SENTRY_DSN` | DSN do Sentry para captura de erros |

### Digital Ocean Spaces — armazenamento de mídias (opcional)

| Variável | Descrição |
|---|---|
| `DO_SPACES_ENDPOINT` | Ex: `nyc3.digitaloceanspaces.com` |
| `DO_SPACES_BUCKET` | Nome do Space (bucket) |
| `DO_SPACES_KEY` | Access Key |
| `DO_SPACES_SECRET` | Secret Key |
| `DO_SPACES_CDN` | URL do CDN (opcional) |

### Gerencianet / Pix (opcional)

| Variável | Descrição |
|---|---|
| `GERENCIANET_SANDBOX` | `true` para testes |
| `GERENCIANET_CLIENT_ID` | Client ID da API |
| `GERENCIANET_CLIENT_SECRET` | Client Secret |
| `GERENCIANET_PIX_CERT` | Nome do certificado `.p12` (sem extensão) |

### InfoSimples — certidões (opcional)

| Variável | Padrão | Descrição |
|---|---|---|
| `INFOSIMPLES_API_KEY` | — | Chave da API InfoSimples |
| `INFOSIMPLES_API_URL` | `https://api.infosimples.com/api/v2` | URL da API |
| `INFOSIMPLES_TIMEOUT` | `60000` | Timeout das requisições (ms) |
| `INFOSIMPLES_MAX_CONSULTAS_MES` | `1000` | Limite mensal de consultas |
| `INFOSIMPLES_ALERT_THRESHOLD` | `800` | Alerta ao atingir este número |
| `INFOSIMPLES_RETRY_ATTEMPTS` | `3` | Tentativas em caso de erro |
| `INFOSIMPLES_RETRY_DELAY` | `5000` | Espera entre tentativas (ms) |
| `CERTIDOES_RETRY_DAYS` | `10` | Dias para reprocessar certidões com erro |

---

## Estrutura do projeto

```
src/
├── adapters/        Adaptadores de WhatsApp (Baileys, WWebJS, Evolution)
├── config/          Configurações (banco, auth, redis)
├── controllers/     Handlers HTTP
├── database/
│   ├── migrations/  344 migrations — histórico completo do schema
│   └── seeds/       Seeds de dados padrão
├── helpers/         Utilitários internos
├── jobs/            Jobs agendados (cron)
├── libs/            Socket.io, cache, Baileys session
├── middleware/      Auth, validação, erros
├── models/          Modelos Sequelize
├── queues/          Filas Bull/Redis
├── routes/          Definição de rotas
└── services/        Lógica de negócio
setup/
├── setup-db.sh      Script de instalação completa
└── seed-initial.cjs Seed do superadmin (interativo ou via env vars)
```
