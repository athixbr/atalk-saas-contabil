import AWS from "aws-sdk";
import mime from "mime-types";
import path from "path";
import os from "os";
import fs from "fs";
import { logger } from "../utils/logger";

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACES_ENDPOINT || "atl1.digitaloceanspaces.com",
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  s3ForcePathStyle: false,
  signatureVersion: "v4"
});

const BUCKET = process.env.DO_SPACES_BUCKET || "atalk";
const CDN = process.env.DO_SPACES_CDN || `https://${BUCKET}.atl1.cdn.digitaloceanspaces.com`;

/**
 * Faz upload de um Buffer para o DO Spaces e retorna a URL pública do CDN.
 * A key deve seguir o padrão: company{id}/filename.ext
 */
export async function uploadBufferToSpaces(
  buffer: Buffer,
  key: string,
  mimeType?: string
): Promise<string> {
  const contentType = (mimeType || mime.lookup(key) || "application/octet-stream") as string;
  logger.info(`[Spaces] ⬆ Enviando: ${key} (${contentType}, ${(buffer.length / 1024).toFixed(1)} KB)`);
  await s3.putObject({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read"
  }).promise();
  const cdnUrl = buildCdnUrl(key);
  logger.info(`[Spaces] ✅ Enviado: ${key} → ${cdnUrl}`);
  return cdnUrl;
}

/**
 * Constrói a URL do CDN com encoding correto de caracteres especiais no path.
 * O # em especial precisa ser %23 para não ser interpretado como fragmento pelo browser.
 */
export function buildCdnUrl(key: string): string {
  const encodedKey = key.split("/").map(segment => encodeURIComponent(segment)).join("/");
  return `${CDN}/${encodedKey}`;
}

/**
 * Constrói a chave S3 mantendo a mesma estrutura de pastas do local.
 * Ex: buildSpacesKey(2, "file.jpg") => "company2/file.jpg"
 *     buildSpacesKey(2, "file.jpg", "tarefas", "123") => "company2/tarefas/123/file.jpg"
 */
export function buildSpacesKey(
  companyId: number | string,
  filename: string,
  typeArch?: string,
  fileId?: string
): string {
  if (typeArch && typeArch !== "announcements" && typeArch !== "chats") {
    const parts = [`company${companyId}`, typeArch];
    if (fileId) parts.push(fileId);
    parts.push(filename);
    return parts.join("/");
  }
  if (typeArch === "announcements" || typeArch === "chats") {
    return `${typeArch}/${filename}`;
  }
  return `company${companyId}/${filename}`;
}

/**
 * Retorna true se a string for uma URL completa (arquivos novos no Spaces).
 */
export function isSpacesUrl(value: string): boolean {
  return typeof value === "string" && (value.startsWith("https://") || value.startsWith("http://"));
}

/**
 * Baixa um arquivo do DO Spaces e retorna o Buffer.
 */
export async function downloadFromSpaces(key: string): Promise<Buffer> {
  logger.info(`[Spaces] ⬇ Baixando: ${key}`);
  const result = await s3.getObject({ Bucket: BUCKET, Key: key }).promise();
  logger.info(`[Spaces] ✅ Download concluído: ${key}`);
  return result.Body as Buffer;
}

/**
 * Extrai a key S3 a partir de uma URL do CDN (faz decode do path).
 * Ex: "https://atalk.atl1.cdn.digitaloceanspaces.com/company2/file%23.jpg" => "company2/file#.jpg"
 */
export function cdnUrlToKey(cdnUrl: string): string {
  const encoded = cdnUrl.replace(`${CDN}/`, "");
  return decodeURIComponent(encoded);
}

/**
 * Garante que o arquivo esteja disponível localmente (em temp), seja baixando do Spaces.
 * Retorna o caminho local para uso (ex: ffmpeg, readFileSync).
 * O chamador é responsável por deletar o arquivo temp após o uso.
 */
export async function ensureLocalFile(
  mediaPath: string,
  cdnUrlOrKey: string
): Promise<string> {
  if (fs.existsSync(mediaPath)) return mediaPath;

  // Arquivo não existe localmente — baixa do Spaces para /tmp
  const filename = path.basename(mediaPath);
  const tempPath = path.join(os.tmpdir(), `atalk-dl-${Date.now()}-${filename}`);
  const key = isSpacesUrl(cdnUrlOrKey) ? cdnUrlToKey(cdnUrlOrKey) : cdnUrlOrKey;
  const buffer = await downloadFromSpaces(key);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}
