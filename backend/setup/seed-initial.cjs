#!/usr/bin/env node
/**
 * seed-initial.cjs
 * Cria os dados mínimos para uma nova instalação:
 *   - 1 Plano padrão
 *   - 1 Empresa (nome configurável)
 *   - Configurações padrão do sistema
 *   - 1 Usuário superadmin
 *
 * Lê as credenciais do banco a partir do .env no diretório pai.
 * Aceita variáveis de ambiente para modo não-interativo (CI/Docker):
 *   SETUP_COMPANY_NAME, SETUP_ADMIN_NAME, SETUP_ADMIN_EMAIL, SETUP_ADMIN_PASSWORD
 */

const { Client } = require("pg");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const path = require("path");
const fs = require("fs");

// ─── Carrega .env ─────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach(line => {
      const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    });
} else {
  console.error("❌  Arquivo .env não encontrado. Execute a partir da raiz do projeto.");
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ask(rl, question, defaultValue = "") {
  return new Promise(resolve => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, answer => resolve(answer.trim() || defaultValue));
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║     ATALK — SETUP INICIAL DO BANCO   ║");
  console.log("╚══════════════════════════════════════╝\n");

  // Coleta dados: via env (Docker/CI) ou interativo
  let companyName, adminName, adminEmail, adminPassword;

  if (process.env.SETUP_COMPANY_NAME) {
    companyName   = process.env.SETUP_COMPANY_NAME;
    adminName     = process.env.SETUP_ADMIN_NAME     || "Admin";
    adminEmail    = process.env.SETUP_ADMIN_EMAIL    || "admin@admin.com";
    adminPassword = process.env.SETUP_ADMIN_PASSWORD || "123456";
    console.log("Modo não-interativo (variáveis de ambiente).\n");
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    companyName   = await ask(rl, "Nome da empresa", "Minha Empresa");
    adminName     = await ask(rl, "Nome do administrador", "Admin");
    adminEmail    = await ask(rl, "E-mail do administrador", "admin@admin.com");
    adminPassword = await ask(rl, "Senha do administrador", "123456");
    rl.close();
  }

  // ─── Conexão ────────────────────────────────────────────────────────────────
  const client = new Client({
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME     || "atalk",
    user:     process.env.DB_USER     || "atalk",
    password: process.env.DB_PASS,
  });

  try {
    await client.connect();
    console.log("\n✓ Conectado ao PostgreSQL");

    // Verifica se já há dados
    const existing = await client.query('SELECT id FROM "Companies" LIMIT 1');
    if (existing.rows.length > 0) {
      console.log("\n⚠  Banco já possui dados. Abortando para evitar duplicatas.");
      console.log("   Se quiser recriar, remova os dados manualmente primeiro.\n");
      await client.end();
      process.exit(0);
    }

    await client.query("BEGIN");

    // ── 1. Plano ──────────────────────────────────────────────────────────────
    const planResult = await client.query(
      `INSERT INTO "Plans"
         (name, users, connections, queues, amount,
          "useWhatsapp", "useFacebook", "useInstagram",
          "useCampaigns", "useSchedules", "useInternalChat", "useExternalApi",
          "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING id`,
      ["Plano Padrão", 10, 10, 10, 0, true, false, false, true, true, true, true]
    );
    const planId = planResult.rows[0].id;
    console.log(`✓ Plano criado (ID: ${planId})`);

    // ── 2. Empresa ────────────────────────────────────────────────────────────
    const companyResult = await client.query(
      `INSERT INTO "Companies" (name, "planId", "createdAt", "updatedAt")
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [companyName, planId]
    );
    const companyId = companyResult.rows[0].id;
    console.log(`✓ Empresa criada: "${companyName}" (ID: ${companyId})`);

    // ── 3. CompaniesSettings ──────────────────────────────────────────────────
    await client.query(
      `INSERT INTO "CompaniesSettings"
         ("companyId", "hoursCloseTicketsAuto", "chatBotType",
          "acceptCallWhatsapp", "userRandom", "sendGreetingMessageOneQueues",
          "sendSignMessage", "sendFarewellWaitingTicket", "userRating",
          "sendGreetingAccepted", "CheckMsgIsGroup", "sendQueuePosition",
          "scheduleType", "acceptAudioMessageContact", "sendMsgTransfTicket",
          "enableLGPD", "requiredTag", "lgpdDeleteMessage", "lgpdHideNumber",
          "lgpdConsent", "lgpdLink", "lgpdMessage", "createdAt", "updatedAt")
       VALUES
         ($1, '9999999999', 'text',
          'enabled', 'enabled', 'enabled',
          'enabled', 'disabled', 'disabled',
          'enabled', 'enabled', 'enabled',
          'disabled', 'enabled', 'enabled',
          'disabled', 'disabled', 'disabled', 'disabled',
          'disabled', '', '', NOW(), NOW())`,
      [companyId]
    );
    console.log("✓ Configurações da empresa criadas");

    // ── 4. Settings ───────────────────────────────────────────────────────────
    const settings = [
      ["userCreation",                  "enabled"],
      ["hoursCloseTicketsAuto",         "9999999999"],
      ["chatBotType",                   "text"],
      ["acceptCallWhatsapp",            "enabled"],
      ["userRandom",                    "enabled"],
      ["sendGreetingMessageOneQueues",  "enabled"],
      ["sendSignMessage",               "enabled"],
      ["sendFarewellWaitingTicket",     "disabled"],
      ["userRating",                    "disabled"],
      ["sendGreetingAccepted",          "enabled"],
      ["CheckMsgIsGroup",               "enabled"],
      ["sendQueuePosition",             "enabled"],
      ["scheduleType",                  "disabled"],
      ["acceptAudioMessageContact",     "enabled"],
      ["enableLGPD",                    "disabled"],
      ["requiredTag",                   "disabled"],
    ];
    for (const [key, value] of settings) {
      await client.query(
        `INSERT INTO "Settings" (key, value, "companyId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [key, value, companyId]
      );
    }
    console.log("✓ Configurações do sistema criadas");

    // ── 5. Usuário superadmin ─────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(adminPassword, 8);
    await client.query(
      `INSERT INTO "Users"
         (name, email, "passwordHash", profile, "companyId", super, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'admin', $4, true, NOW(), NOW())`,
      [adminName, adminEmail, passwordHash, companyId]
    );
    console.log(`✓ Administrador criado: ${adminEmail}`);

    await client.query("COMMIT");

    console.log("\n╔══════════════════════════════════════╗");
    console.log("║        SETUP CONCLUÍDO! ✓            ║");
    console.log("╚══════════════════════════════════════╝");
    console.log(`\n  Empresa : ${companyName}`);
    console.log(`  E-mail  : ${adminEmail}`);
    console.log(`  Senha   : ${adminPassword}`);
    console.log("\n  ⚠  Altere a senha após o primeiro acesso!\n");

  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("\n❌  Erro durante o setup:", err.message);
    if (err.detail) console.error("   Detalhe:", err.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
