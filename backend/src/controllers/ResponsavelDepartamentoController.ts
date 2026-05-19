import { Request, Response } from "express";
import ListResponsaveisDepartamentoService from "../services/ResponsavelDepartamentoServices/ListResponsaveisDepartamentoService";
import CreateResponsavelDepartamentoService from "../services/ResponsavelDepartamentoServices/CreateResponsavelDepartamentoService";
import CreateMultipleResponsaveisDepartamentoService from "../services/ResponsavelDepartamentoServices/CreateMultipleResponsaveisDepartamentoService";
import DeleteResponsavelDepartamentoService from "../services/ResponsavelDepartamentoServices/DeleteResponsavelDepartamentoService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;

  const { responsaveis } = await ListResponsaveisDepartamentoService({
    clienteId: parseInt(clienteId),
    companyId,
  });

  return res.json(responsaveis);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;
  const { departamentoId, userId, userIds } = req.body;

  // Se userIds for fornecido (array), usa a criação múltipla
  if (userIds && Array.isArray(userIds) && userIds.length > 0) {
    const result = await CreateMultipleResponsaveisDepartamentoService({
      clienteId: parseInt(clienteId),
      departamentoId,
      userIds,
      companyId,
    });

    return res.status(201).json({
      message: `${result.created.length} responsável(is) adicionado(s) com sucesso`,
      created: result.created,
      skipped: result.skipped,
    });
  }

  // Caso contrário, usa a criação única (compatibilidade)
  const responsavel = await CreateResponsavelDepartamentoService({
    clienteId: parseInt(clienteId),
    departamentoId,
    userId,
    companyId,
  });

  return res.status(201).json(responsavel);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { responsavelId } = req.params;

  await DeleteResponsavelDepartamentoService({
    id: parseInt(responsavelId),
    companyId,
  });

  return res.status(204).send();
};
