import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";

export const index = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const connections = await Whatsapp.findAll({
    where: { companyId },
    attributes: ["id", "name", "number", "status", "isDefaultNotification"],
    order: [["name", "ASC"]]
  });
  return res.json({ connections });
};

export const setDefault = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  const { id } = req.params;

  await Whatsapp.update(
    { isDefaultNotification: false },
    { where: { companyId } }
  );

  await Whatsapp.update(
    { isDefaultNotification: true },
    { where: { id: Number(id), companyId } }
  );

  return res.json({ message: "Conexão padrão definida" });
};

export const unsetDefault = async (req: Request, res: Response) => {
  const { companyId } = req.user;
  await Whatsapp.update(
    { isDefaultNotification: false },
    { where: { companyId } }
  );
  return res.json({ message: "Padrão removido" });
};
