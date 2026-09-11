import { Request, Response } from "express";
import ListContatoDepartamentosService from "../services/ContatoDepartamentoServices/ListContatoDepartamentosService";
import SetContatoDepartamentosService from "../services/ContatoDepartamentoServices/SetContatoDepartamentosService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId, contatoId } = req.params;

  const { departamentos } = await ListContatoDepartamentosService({
    clienteId: parseInt(clienteId),
    clienteContatoId: parseInt(contatoId),
    companyId,
  });

  return res.status(200).json(departamentos);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId, contatoId } = req.params;
  const { departamentoIds } = req.body;

  const { departamentos } = await SetContatoDepartamentosService({
    clienteId: parseInt(clienteId),
    clienteContatoId: parseInt(contatoId),
    departamentoIds,
    companyId,
  });

  return res.status(200).json(departamentos);
};
