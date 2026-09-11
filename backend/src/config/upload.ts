import path from "path";
import multer from "multer";
import { Request as ExpressRequest } from "express";
import Whatsapp from "../models/Whatsapp";

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

export const getCompanyId = async (req: ExpressRequest): Promise<number> => {
  let companyId: number = (req as any).user?.companyId;
  if (!companyId) {
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const whatsapp = await Whatsapp.findOne({ where: { token } });
    companyId = whatsapp.companyId;
  }
  return companyId;
};

/**
 * Reproduz a mesma estrutura de pastas/nome de arquivo que o antigo
 * multer.diskStorage usava, agora como uma key de storage (Backblaze B2 / DO Spaces).
 * `filename` é só o nome do arquivo (compatível com o valor que os controllers já
 * esperam em `file.filename`); `key` é o caminho relativo completo (pasta + nome).
 */
export const buildUploadKey = (
  companyId: number,
  originalname: string,
  typeArch?: string,
  fileId?: string
): { folder: string; filename: string; key: string } => {
  const cleanName = originalname.replace(/\//g, "-");
  const filename =
    typeArch && typeArch !== "announcements" ? cleanName : `${Date.now()}_${cleanName}`;

  let folder: string;
  if (typeArch === "announcements" || typeArch === "chats") {
    folder = typeArch;
  } else if (typeArch) {
    folder = fileId ? `company${companyId}/${typeArch}/${fileId}` : `company${companyId}/${typeArch}`;
  } else {
    folder = `company${companyId}`;
  }

  return { folder, filename, key: `${folder}/${filename}` };
};

const storage = multer.memoryStorage();

export default {
  directory: publicFolder,
  storage
};
