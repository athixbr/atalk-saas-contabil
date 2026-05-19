import path from "path";
import multer from "multer";
import fs from "fs";
import { Request as ExpressRequest } from "express";
import Whatsapp from "../models/Whatsapp";

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const getCompanyId = async (req: ExpressRequest): Promise<number> => {
  let companyId: number = (req as any).user?.companyId;
  if (!companyId) {
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const whatsapp = await Whatsapp.findOne({ where: { token } });
    companyId = whatsapp.companyId;
  }
  return companyId;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    getCompanyId(req as ExpressRequest)
      .then(companyId => {
        const { typeArch, fileId } = (req as any).body || {};
        let folder: string;
        if (typeArch === "announcements" || typeArch === "chats") {
          folder = path.join(publicFolder, typeArch);
        } else if (typeArch) {
          folder = fileId
            ? path.join(publicFolder, `company${companyId}`, typeArch, fileId)
            : path.join(publicFolder, `company${companyId}`, typeArch);
        } else {
          folder = path.join(publicFolder, `company${companyId}`);
        }
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
      })
      .catch(err => cb(err, null));
  },
  filename: (req, file, cb) => {
    const { typeArch } = (req as any).body || {};
    const cleanName = file.originalname.replace(/\//g, "-");
    const filename =
      typeArch && typeArch !== "announcements"
        ? cleanName
        : `${Date.now()}_${cleanName}`;
    cb(null, filename);
  }
});

export default {
  directory: publicFolder,
  storage
};
