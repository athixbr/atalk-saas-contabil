import mime from "mime-types";
import path from "path";
import os from "os";
import fs from "fs";
import axios from "axios";
import { logger } from "../utils/logger";
import {
  getS3Client,
  BUCKET_NAME,
  prefixKey,
  buildProxyUrl,
  proxyUrlToKey
} from "../config/storage";

const s3 = getS3Client();

/**
 * Faz upload de um Buffer para o storage (Backblaze B2 ou DO Spaces, conforme .env)
 * e retorna a URL de proxy servida pelo próprio backend (ver rota "/public" em app.ts).
 * A key deve seguir o padrão: company{id}/filename.ext
 */
export async function uploadBufferToSpaces(
  buffer: Buffer,
  key: string,
  mimeType?: string
): Promise<string> {
  const contentType = (mimeType || mime.lookup(key) || "application/octet-stream") as string;
  logger.info(`[Storage] ⬆ Enviando: ${key} (${contentType}, ${(buffer.length / 1024).toFixed(1)} KB)`);
  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: prefixKey(key),
    Body: buffer,
    ContentType: contentType
  }).promise();
  const proxyUrl = buildCdnUrl(key);
  logger.info(`[Storage] ✅ Enviado: ${key} → ${proxyUrl}`);
  return proxyUrl;
}

/**
 * Constrói a URL pública (via proxy do backend) para uma key relativa do storage.
 */
export function buildCdnUrl(key: string): string {
  return buildProxyUrl(key);
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
 * Retorna true se a string for uma URL completa (arquivo já enviado ao storage).
 */
export function isSpacesUrl(value: string): boolean {
  return typeof value === "string" && (value.startsWith("https://") || value.startsWith("http://"));
}

/**
 * Baixa um arquivo do storage e retorna o Buffer.
 */
export async function downloadFromSpaces(key: string): Promise<Buffer> {
  logger.info(`[Storage] ⬇ Baixando: ${key}`);
  const result = await s3.getObject({ Bucket: BUCKET_NAME, Key: prefixKey(key) }).promise();
  logger.info(`[Storage] ✅ Download concluído: ${key}`);
  return result.Body as Buffer;
}

/**
 * Extrai a key do storage a partir de uma URL de proxy (faz decode do path).
 * Ex: "https://app-api.atalk.com.br/public/company2/file%23.jpg" => "company2/file#.jpg"
 */
export function cdnUrlToKey(cdnUrl: string): string {
  return proxyUrlToKey(cdnUrl);
}

/**
 * Garante que o arquivo esteja disponível localmente (em temp), baixando do storage
 * (ou de uma URL externa antiga, para mídias enviadas antes desta migração).
 * Retorna o caminho local para uso (ex: ffmpeg, readFileSync).
 * O chamador é responsável por deletar o arquivo temp após o uso.
 */
export async function ensureLocalFile(
  mediaPath: string,
  cdnUrlOrKey: string
): Promise<string> {
  if (fs.existsSync(mediaPath)) return mediaPath;

  const filename = path.basename(mediaPath);
  const tempPath = path.join(os.tmpdir(), `atalk-dl-${Date.now()}-${filename}`);

  if (isSpacesUrl(cdnUrlOrKey) && !cdnUrlOrKey.includes("/public/")) {
    // URL externa (ex: mídia enviada antes da migração, hospedada em outro storage/CDN)
    const response = await axios.get<ArrayBuffer>(cdnUrlOrKey, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, Buffer.from(response.data));
    return tempPath;
  }

  const key = isSpacesUrl(cdnUrlOrKey) ? cdnUrlToKey(cdnUrlOrKey) : cdnUrlOrKey;
  const buffer = await downloadFromSpaces(key);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}
