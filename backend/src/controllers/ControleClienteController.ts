import { Request, Response } from "express";
import VincularClientesControleService from "../services/ControleClienteServices/VincularClientesControleService";
import DesvincularClienteControleService from "../services/ControleClienteServices/DesvincularClienteControleService";
import AlterarDatasControleService from "../services/ControleClienteServices/AlterarDatasControleService";
import AlterarResponsavelControleService from "../services/ControleClienteServices/AlterarResponsavelControleService";
import AlterarDatasEmLoteService from "../services/ControleClienteServices/AlterarDatasEmLoteService";
import DesvincularEmLoteService from "../services/ControleClienteServices/DesvincularEmLoteService";
import ListarVinculosService from "../services/ControleClienteServices/ListarVinculosService";
import EstatisticasControleService from "../services/ControleClienteServices/EstatisticasControleService";
import GerarTarefasControleService from "../services/ControleClienteServices/GerarTarefasControleService";
import ControleCliente from "../models/ControleCliente";
import ControleClienteHistorico from "../models/ControleClienteHistorico";
import AppError from "../errors/AppError";

export const vincular = async (req: Request, res: Response): Promise<Response> => {
  const {
    controleConfigId,
    tarefaConfigId,
    clientes,
    departamentoId,
    usuarioId,
    usuariosIds,
    observacoes,
    gerarTarefasImediatamente,
  } = req.body;

  const { companyId } = req.user;
  const usuarioLogadoId = parseInt(req.user.id.toString());

  try {
    const resultado = await VincularClientesControleService({
      controleConfigId,
      tarefaConfigId,
      clientes,
      departamentoId,
      usuarioId,
      usuariosIds,
      observacoes,
      companyId,
      usuarioLogadoId,
      gerarTarefasImediatamente,
    });

    return res.status(201).json(resultado);
  } catch (error: any) {
    console.error("Erro ao vincular clientes:", error);
    throw new AppError(error.message || "Erro ao vincular clientes", error.statusCode || 500);
  }
};

export const desvincular = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteId } = req.params;
  const { observacao, excluirDefinitivamente } = req.body;

  const { companyId } = req.user;
  const usuarioLogadoId = parseInt(req.user.id.toString());

  try {
    const resultado = await DesvincularClienteControleService({
      controleClienteId: parseInt(controleClienteId),
      companyId,
      usuarioLogadoId,
      observacao,
      excluirDefinitivamente,
    });

    return res.status(200).json({
      message: excluirDefinitivamente
        ? "Vínculo excluído com sucesso"
        : "Vínculo desativado com sucesso",
      vinculo: resultado,
    });
  } catch (error: any) {
    console.error("Erro ao desvincular cliente:", error);
    throw new AppError(error.message || "Erro ao desvincular cliente", error.statusCode || 500);
  }
};

export const alterarDatas = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteId } = req.params;
  const { dataInicio, dataFim, observacao } = req.body;

  const { companyId } = req.user;
  const usuarioLogadoId = parseInt(req.user.id.toString());

  try {
    const vinculo = await AlterarDatasControleService({
      controleClienteId: parseInt(controleClienteId),
      dataInicio,
      dataFim,
      companyId,
      usuarioLogadoId,
      observacao,
    });

    return res.status(200).json(vinculo);
  } catch (error: any) {
    console.error("Erro ao alterar datas:", error);
    throw new AppError(error.message || "Erro ao alterar datas", error.statusCode || 500);
  }
};

export const alterarResponsavel = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteId } = req.params;
  const { departamentoId, usuarioId, usuariosIds, observacao } = req.body;

  const { companyId } = req.user;
  const usuarioLogadoId = parseInt(req.user.id.toString());

  try {
    const vinculo = await AlterarResponsavelControleService({
      controleClienteId: parseInt(controleClienteId),
      departamentoId,
      usuarioId,
      usuariosIds,
      companyId,
      usuarioLogadoId,
      observacao,
    });

    return res.status(200).json(vinculo);
  } catch (error: any) {
    console.error("Erro ao alterar responsável:", error);
    throw new AppError(error.message || "Erro ao alterar responsável", error.statusCode || 500);
  }
};

export const listar = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const {
    controleConfigId,
    clienteId,
    departamentoId,
    usuarioId,
    ativo,
    dataInicioMin,
    dataInicioMax,
    dataFimMin,
    dataFimMax,
    searchParam,
    pageNumber,
    pageSize,
  } = req.query;

  try {
    const resultado = await ListarVinculosService({
      companyId,
      controleConfigId: controleConfigId ? parseInt(controleConfigId as string) : undefined,
      clienteId: clienteId ? parseInt(clienteId as string) : undefined,
      departamentoId: departamentoId ? parseInt(departamentoId as string) : undefined,
      usuarioId: usuarioId ? parseInt(usuarioId as string) : undefined,
      ativo: ativo !== undefined ? ativo === "true" : undefined,
      dataInicioMin: dataInicioMin ? new Date(dataInicioMin as string) : undefined,
      dataInicioMax: dataInicioMax ? new Date(dataInicioMax as string) : undefined,
      dataFimMin: dataFimMin ? new Date(dataFimMin as string) : undefined,
      dataFimMax: dataFimMax ? new Date(dataFimMax as string) : undefined,
      searchParam: searchParam as string,
      pageNumber: pageNumber ? parseInt(pageNumber as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    console.error("Erro ao listar vínculos:", error);
    throw new AppError(error.message || "Erro ao listar vínculos", error.statusCode || 500);
  }
};

export const buscarPorId = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteId } = req.params;
  const { companyId } = req.user;

  try {
    const vinculo = await ControleCliente.findOne({
      where: { id: controleClienteId },
      include: [
        {
          association: "controleConfig",
          where: { companyId },
        },
        { association: "cliente" },
        { association: "departamento" },
        { association: "usuario" },
      ],
    });

    if (!vinculo) {
      throw new AppError("Vínculo não encontrado", 404);
    }

    return res.status(200).json(vinculo);
  } catch (error: any) {
    console.error("Erro ao buscar vínculo:", error);
    throw new AppError(error.message || "Erro ao buscar vínculo", error.statusCode || 500);
  }
};

export const buscarHistorico = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteId } = req.params;
  const { companyId } = req.user;

  try {
    const historico = await ControleClienteHistorico.findAll({
      where: { controleClienteId, companyId },
      include: [
        {
          association: "usuario",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(historico);
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    throw new AppError(error.message || "Erro ao buscar histórico", error.statusCode || 500);
  }
};

export const estatisticas = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { controleConfigId, departamentoId } = req.query;

  try {
    const stats = await EstatisticasControleService({
      companyId,
      controleConfigId: controleConfigId ? parseInt(controleConfigId as string) : undefined,
      departamentoId: departamentoId ? parseInt(departamentoId as string) : undefined,
    });

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error);
    throw new AppError(error.message || "Erro ao buscar estatísticas", error.statusCode || 500);
  }
};

export const gerarTarefas = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteId } = req.params;
  const { forcarRegeneracao } = req.body;
  const { companyId } = req.user;

  try {
    const resultado = await GerarTarefasControleService({
      controleClienteId: parseInt(controleClienteId),
      companyId,
      forcarRegeneracao: forcarRegeneracao || false,
    });

    return res.status(200).json(resultado);
  } catch (error: any) {
    console.error("Erro ao gerar tarefas:", error);
    throw new AppError(error.message || "Erro ao gerar tarefas", error.statusCode || 500);
  }
};

export const alterarDatasEmLote = async (req: Request, res: Response): Promise<Response> => {
  const { vinculos, observacao } = req.body;
  const { companyId } = req.user;
  const usuarioLogadoId = parseInt(req.user.id.toString());

  try {
    const resultado = await AlterarDatasEmLoteService({
      vinculos,
      companyId,
      usuarioLogadoId,
      observacao,
    });

    return res.status(200).json({
      message: `${resultado.vinculosAlterados} vínculo(s) alterado(s) com sucesso`,
      ...resultado,
    });
  } catch (error: any) {
    console.error("Erro ao alterar datas em lote:", error);
    throw new AppError(error.message || "Erro ao alterar datas em lote", error.statusCode || 500);
  }
};

export const desvincularEmLote = async (req: Request, res: Response): Promise<Response> => {
  const { controleClienteIds, observacao, excluirDefinitivamente } = req.body;
  const { companyId } = req.user;
  const usuarioLogadoId = parseInt(req.user.id.toString());

  try {
    const resultado = await DesvincularEmLoteService({
      controleClienteIds,
      companyId,
      usuarioLogadoId,
      observacao,
      excluirDefinitivamente,
    });

    return res.status(200).json({
      message: `${resultado.vinculosRemovidos} vínculo(s) ${excluirDefinitivamente ? 'excluído(s)' : 'desativado(s)'} com sucesso`,
      ...resultado,
    });
  } catch (error: any) {
    console.error("Erro ao desvincular em lote:", error);
    throw new AppError(error.message || "Erro ao desvincular em lote", error.statusCode || 500);
  }
};
