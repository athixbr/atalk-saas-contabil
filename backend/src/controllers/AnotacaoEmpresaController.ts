import { Request, Response } from "express";
import ListAnotacoesEmpresaService from "../services/AnotacaoEmpresaServices/ListAnotacoesEmpresaService";
import CreateAnotacaoEmpresaService from "../services/AnotacaoEmpresaServices/CreateAnotacaoEmpresaService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;

  const { anotacoes } = await ListAnotacoesEmpresaService({
    clienteId: parseInt(clienteId),
    companyId,
  });

  return res.json(anotacoes);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { clienteId } = req.params;
  const { anotacao } = req.body;

  const anotacaoEmpresa = await CreateAnotacaoEmpresaService({
    clienteId: parseInt(clienteId),
    userId: parseInt(userId as any),
    anotacao,
    companyId,
  });

  return res.status(201).json(anotacaoEmpresa);
};
