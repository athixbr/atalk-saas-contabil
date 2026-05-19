import { Request, Response } from "express";
import CreateOrUpdatePerfilCargoService from "../services/PerfilCargoServices/CreateOrUpdatePerfilCargoService";
import ShowPerfilCargoService from "../services/PerfilCargoServices/ShowPerfilCargoService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  const perfil = await ShowPerfilCargoService({
    userId: parseInt(userId),
    companyId,
  });

  return res.json(perfil);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;
  const perfilData = req.body;

  const perfil = await CreateOrUpdatePerfilCargoService({
    userId: parseInt(userId),
    companyId,
    perfilData,
  });

  return res.status(200).json(perfil);
};
