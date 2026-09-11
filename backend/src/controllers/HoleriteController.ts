import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import DigitalOceanService from "../services/DigitalOceanService";
import ListHoleritesService from "../services/HoleriteServices/ListHoleritesService";
import CreateHoleriteService from "../services/HoleriteServices/CreateHoleriteService";
import DeleteHoleriteService from "../services/HoleriteServices/DeleteHoleriteService";
import ShowHoleriteService from "../services/HoleriteServices/ShowHoleriteService";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  const holerites = await ListHoleritesService({
    userId: parseInt(userId),
    companyId,
  });

  return res.json(holerites);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId, id: uploadedBy } = req.user;
  const { mesReferencia, anoReferencia } = req.body;

  if (!req.file) {
    throw new AppError("Arquivo PDF é obrigatório", 400);
  }

  // Verificar se é PDF
  if (req.file.mimetype !== "application/pdf") {
    throw new AppError("Apenas arquivos PDF são permitidos", 400);
  }

  // Caminho relativo para salvar no banco
  const arquivoPdf = `company${companyId}/holerites/${req.file.filename}`;

  const holerite = await CreateHoleriteService({
    userId: parseInt(userId),
    mesReferencia: parseInt(mesReferencia),
    anoReferencia: parseInt(anoReferencia),
    arquivoPdf,
    uploadedBy: parseInt(uploadedBy as string),
    companyId,
  });

  return res.status(201).json(holerite);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { holeriteId } = req.params;
  const { companyId } = req.user;

  await DeleteHoleriteService({
    holeriteId: parseInt(holeriteId),
    companyId,
  });

  return res.status(204).send();
};

export const download = async (req: Request, res: Response): Promise<void> => {
  const { holeriteId } = req.params;
  const { companyId } = req.user;

  const holerite = await ShowHoleriteService({
    holeriteId: parseInt(holeriteId),
    companyId,
  });

  const filePath = path.join(__dirname, "..", "..", "public", holerite.arquivoPdf);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
    return;
  }

  try {
    const stream = DigitalOceanService.getDownloadStream(holerite.arquivoPdf);
    stream.on("error", () => {
      if (!res.headersSent) res.status(404).json({ error: "Arquivo não encontrado" });
    });
    res.setHeader("Content-Type", mime.lookup(holerite.arquivoPdf) || "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(holerite.arquivoPdf)}"`
    );
    stream.pipe(res);
  } catch (err) {
    throw new AppError("Arquivo não encontrado", 404);
  }
};
