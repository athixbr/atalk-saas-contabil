import { Request, Response } from "express";
import CreateControleConfigService from "../services/ControleConfigServices/CreateControleConfigService";
import ListControleConfigService from "../services/ControleConfigServices/ListControleConfigService";
import ShowControleConfigService from "../services/ControleConfigServices/ShowControleConfigService";
import UpdateControleConfigService from "../services/ControleConfigServices/UpdateControleConfigService";
import DeleteControleConfigService from "../services/ControleConfigServices/DeleteControleConfigService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const { controles, count } = await ListControleConfigService({
    companyId,
  });

  return res.json({ controles, count });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { controleConfigId } = req.params;
  const { companyId } = req.user;

  const controleConfig = await ShowControleConfigService({
    controleConfigId: parseInt(controleConfigId),
    companyId,
  });

  return res.json(controleConfig);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    codigo,
    nome,
    departamentoId,
    grupoServicoId,
    tipoServicoId,
    prioridadeId,
    prazoId,
    tipoControle,
    recorrente,
    valorReferencial,
    sabadoUtil,
    diasNaoUteis,
    diasLembrete,
    aceitaArquivos,
    ativo,
    clientes,
  } = req.body;

  const controleConfig = await CreateControleConfigService({
    codigo,
    nome,
    departamentoId,
    grupoServicoId,
    tipoServicoId,
    prioridadeId,
    prazoId,
    tipoControle,
    recorrente,
    valorReferencial,
    sabadoUtil,
    diasNaoUteis,
    diasLembrete,
    aceitaArquivos,
    ativo,
    companyId,
    clientes,
  });

  return res.status(200).json(controleConfig);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { controleConfigId } = req.params;
  const {
    codigo,
    nome,
    departamentoId,
    grupoServicoId,
    tipoServicoId,
    prioridadeId,
    prazoId,
    tipoControle,
    recorrente,
    valorReferencial,
    sabadoUtil,
    diasNaoUteis,
    diasLembrete,
    aceitaArquivos,
    ativo,
    clientes,
  } = req.body;

  const controleConfig = await UpdateControleConfigService({
    controleConfigId: parseInt(controleConfigId),
    codigo,
    nome,
    departamentoId,
    grupoServicoId,
    tipoServicoId,
    prioridadeId,
    prazoId,
    tipoControle,
    recorrente,
    valorReferencial,
    sabadoUtil,
    diasNaoUteis,
    diasLembrete,
    aceitaArquivos,
    ativo,
    clientes,
  });

  return res.status(200).json(controleConfig);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { controleConfigId } = req.params;

  await DeleteControleConfigService({
    controleConfigId: parseInt(controleConfigId),
  });

  return res.status(200).json({ message: "Controle deletado com sucesso" });
};
