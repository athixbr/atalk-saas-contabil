import AWS from "aws-sdk";

const truthy = (value?: string): boolean => /^(y|yes|true|1)$/i.test(value || "");

export const USE_B2 = truthy(process.env.USE_B2);

export const STORAGE_ROOT = USE_B2 ? "atalk-producao" : "";

export const BUCKET_NAME = USE_B2
  ? process.env.B2_BUCKET || "atalk-saas"
  : process.env.DO_SPACES_BUCKET || "atalk";

export const getS3Client = (): AWS.S3 => {
  if (USE_B2) {
    return new AWS.S3({
      endpoint: process.env.B2_ENDPOINT,
      accessKeyId: process.env.B2_ACCESS_KEY,
      secretAccessKey: process.env.B2_SECRET_KEY,
      region: process.env.B2_REGION,
      s3ForcePathStyle: true,
      signatureVersion: "v4"
    });
  }

  return new AWS.S3({
    endpoint: process.env.DO_SPACES_ENDPOINT || "nyc3.digitaloceanspaces.com",
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    s3ForcePathStyle: false,
    signatureVersion: "v4"
  });
};

/** Prefixa a key com a pasta raiz do storage (ex: "atalk-producao/") quando aplicável. */
export const prefixKey = (key: string): string => {
  const clean = key.replace(/^\/+/, "");
  return STORAGE_ROOT ? `${STORAGE_ROOT}/${clean}` : clean;
};

/** Remove o prefixo da pasta raiz, devolvendo a key "pública" (usada nas URLs de proxy). */
export const unprefixKey = (key: string): string => {
  if (STORAGE_ROOT && key.startsWith(`${STORAGE_ROOT}/`)) {
    return key.slice(STORAGE_ROOT.length + 1);
  }
  return key;
};

const backendOrigin = (): string =>
  `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}`;

/**
 * Monta a URL pública de proxy para uma key relativa (sem o prefixo da pasta raiz).
 * Os bytes nunca são expostos direto do bucket: quem responde é o próprio backend,
 * via a rota "/public" (ver app.ts), que busca o objeto no storage sob demanda.
 */
export const buildProxyUrl = (key: string): string => {
  const clean = key.replace(/^\/+/, "");
  const encoded = clean.split("/").map(encodeURIComponent).join("/");
  return `${backendOrigin()}/public/${encoded}`;
};

/** Extrai a key relativa (sem prefixo) a partir de uma URL de proxy gerada por buildProxyUrl. */
export const proxyUrlToKey = (url: string): string => {
  const prefix = `${backendOrigin()}/public/`;
  const encoded = url.startsWith(prefix) ? url.slice(prefix.length) : url;
  return decodeURIComponent(encoded);
};
