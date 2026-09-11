import { Request, Response, NextFunction } from "express";
import { Request as ExpressRequest } from "express";
import { getCompanyId, buildUploadKey } from "../config/upload";
import { uploadBufferToSpaces } from "../helpers/uploadToSpaces";

/**
 * Roda depois do multer (memoryStorage): sobe cada arquivo recebido para o
 * storage (Backblaze B2 / DO Spaces) e reescreve `file.filename` para o mesmo
 * valor que o antigo multer.diskStorage produzia, para que os controllers
 * existentes continuem funcionando sem alteração.
 */
const uploadFilesToStorage = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files: Express.Multer.File[] = req.files
      ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat())
      : req.file
      ? [req.file]
      : [];

    if (files.length === 0) {
      next();
      return;
    }

    const companyId = await getCompanyId(req as ExpressRequest);
    const { typeArch, fileId } = (req.body || {}) as { typeArch?: string; fileId?: string };

    for (const file of files) {
      const { filename, key } = buildUploadKey(companyId, file.originalname, typeArch, fileId);
      await uploadBufferToSpaces(file.buffer, key, file.mimetype);
      (file as any).filename = filename;
      (file as any).path = key;
      (file as any).storageKey = key;
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default uploadFilesToStorage;
