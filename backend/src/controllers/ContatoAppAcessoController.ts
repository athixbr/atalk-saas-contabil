import { Request, Response } from "express";
import GetContatoAppAcessoService from "../services/ContatoAppAcessoServices/GetContatoAppAcessoService";
import SetContatoAppAcessoService from "../services/ContatoAppAcessoServices/SetContatoAppAcessoService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId, contatoId } = req.params;

  const result = await GetContatoAppAcessoService({
    clienteId: parseInt(clienteId),
    clienteContatoId: parseInt(contatoId),
    companyId,
  });

  return res.status(200).json(result);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId, contatoId } = req.params;
  const { ativo, senha } = req.body;

  const result = await SetContatoAppAcessoService({
    clienteId: parseInt(clienteId),
    clienteContatoId: parseInt(contatoId),
    companyId,
    ativo,
    senha,
  });

  return res.status(200).json(result);
};
