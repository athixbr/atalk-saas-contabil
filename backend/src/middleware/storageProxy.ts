import { Request, Response } from "express";
import mime from "mime-types";
import DigitalOceanService from "../services/DigitalOceanService";
import { logger } from "../utils/logger";

/**
 * Fallback da rota "/public": quando o arquivo não está mais em disco local,
 * busca no storage (Backblaze B2 / DO Spaces) e transmite os bytes via este
 * mesmo backend — o bucket nunca é exposto diretamente ao navegador.
 */
const serveFromStorage = async (req: Request, res: Response): Promise<void> => {
  const key = decodeURIComponent(req.path.replace(/^\/+/, ""));

  if (!key) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  try {
    const stream = DigitalOceanService.getDownloadStream(key);

    stream.on("error", (err: any) => {
      if (err?.code !== "NoSuchKey" && err?.statusCode !== 404) {
        logger.error(`[Storage] Erro ao servir "${key}": ${err?.message || err}`);
      }
      if (!res.headersSent) {
        res.status(404).json({ error: "File not found" });
      }
    });

    res.setHeader("Content-Type", mime.lookup(key) || "application/octet-stream");
    stream.pipe(res);
  } catch (err: any) {
    logger.error(`[Storage] Erro ao servir "${key}": ${err?.message || err}`);
    res.status(404).json({ error: "File not found" });
  }
};

export default serveFromStorage;
