/**
 * docker-server.js
 * Serve o build do React e injeta variáveis de ambiente em window.ENV no HTML.
 *
 * O src/config.js já usa window.ENV quando disponível, então a mesma imagem
 * Docker funciona em dev, staging e produção — basta trocar as env vars no Coolify.
 */
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const BUILD_DIR = path.join(__dirname, "build");

// Lê o index.html uma vez na inicialização
const indexPath = path.join(BUILD_DIR, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("❌  build/index.html não encontrado. Rode npm run build antes.");
  process.exit(1);
}

let indexHtml = fs.readFileSync(indexPath, "utf-8");

// Injeta as variáveis de runtime no <head>
const windowEnv = {
  REACT_APP_BACKEND_URL:               process.env.REACT_APP_BACKEND_URL              || "",
  REACT_APP_PRIMARY_COLOR:             process.env.REACT_APP_PRIMARY_COLOR             || "",
  REACT_APP_PRIMARY_DARK:              process.env.REACT_APP_PRIMARY_DARK              || "",
  REACT_APP_NUMBER_SUPPORT:            process.env.REACT_APP_NUMBER_SUPPORT            || "",
  REACT_APP_HOURS_CLOSE_TICKETS_AUTO:  process.env.REACT_APP_HOURS_CLOSE_TICKETS_AUTO  || "",
  REACT_APP_FACEBOOK_APP_ID:           process.env.REACT_APP_FACEBOOK_APP_ID           || "",
};

const envScript = `<script>window.ENV = ${JSON.stringify(windowEnv)};</script>`;
indexHtml = indexHtml.replace("</head>", `${envScript}\n</head>`);

// Arquivos estáticos (JS, CSS, imagens, fontes).
// Os arquivos em /static têm hash no nome (gerado a cada build), então podem
// ficar em cache "para sempre" — uma build nova sempre gera nomes novos.
app.use(
  express.static(BUILD_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.includes(`${path.sep}static${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  })
);

// SPA fallback — todas as rotas devolvem o index.html com window.ENV,
// sempre revalidado para que o navegador nunca sirva uma versão antiga.
app.get("/*", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.send(indexHtml);
});

app.listen(PORT, () => {
  console.log(`✓  Frontend rodando na porta ${PORT}`);
  console.log(`   Backend URL: ${windowEnv.REACT_APP_BACKEND_URL || "(não configurado)"}`);
});
