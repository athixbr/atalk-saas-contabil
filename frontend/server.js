//simple express server to run frontend production build;
const express = require("express");
const path = require("path");
const fs = require("fs");
const proxy = require("http-proxy-middleware");
const app = express();

const BUILD_DIR = path.join(__dirname, "build");
const INDEX_PATH = path.join(BUILD_DIR, "index.html");
const BUILDING_PATH = path.join(__dirname, "building.html");

const isBuildReady = () => fs.existsSync(INDEX_PATH);

// Consultado pela página de "aguarde" para saber quando recarregar sozinha.
app.get("/__build-status", (req, res) => {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	res.json({ ready: isBuildReady() });
});

// Módulo SPED Fiscal (analise-sped-fiscal-efd-icms-ipi) roda como app estático
// separado via PM2 (atalk-sped-fiscal, porta 3220). Proxy same-origin para que
// carregue embutido no sistema em vez de abrir um domínio externo.
app.use(
	"/sped-fiscal",
	proxy({
		target: "http://localhost:3220",
		changeOrigin: true,
		pathRewrite: { "^/sped-fiscal": "" },
	})
);

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

app.get("/*", function (req, res) {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	if (isBuildReady()) {
		res.sendFile(INDEX_PATH);
	} else {
		res.status(200).sendFile(BUILDING_PATH);
	}
});
app.listen(3000);

