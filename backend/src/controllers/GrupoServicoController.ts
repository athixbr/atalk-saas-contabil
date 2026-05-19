import { Request, Response } from "express";
import GrupoServico from "../models/GrupoServico";
import TipoServico from "../models/TipoServico";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { tipoServicoId } = req.query;
    
    const where: any = { companyId };
    if (tipoServicoId) {
      where.tipoServicoId = tipoServicoId;
    }

    const gruposServico = await GrupoServico.findAll({
      where,
      include: [{ model: TipoServico, as: "tipoServico" }],
      order: [["nome", "ASC"]]
    });

    return res.status(200).json(gruposServico);
  } catch (error) {
    console.error("Erro ao listar grupos de serviço:", error);
    return res.status(500).json({ error: "Erro ao listar grupos de serviço" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const grupoServico = await GrupoServico.findOne({
      where: { id, companyId },
      include: [{ model: TipoServico, as: "tipoServico" }]
    });

    if (!grupoServico) {
      return res.status(404).json({ error: "Grupo de serviço não encontrado" });
    }

    return res.status(200).json(grupoServico);
  } catch (error) {
    console.error("Erro ao buscar grupo de serviço:", error);
    return res.status(500).json({ error: "Erro ao buscar grupo de serviço" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { nome, codigo, descricao, ativo, tipoServicoId } = req.body;

    const grupoServico = await GrupoServico.create({
      companyId,
      tipoServicoId,
      nome,
      codigo,
      descricao,
      ativo
    });

    return res.status(201).json(grupoServico);
  } catch (error) {
    console.error("Erro ao criar grupo de serviço:", error);
    return res.status(500).json({ error: "Erro ao criar grupo de serviço" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { nome, codigo, descricao, ativo, tipoServicoId } = req.body;

    const grupoServico = await GrupoServico.findOne({
      where: { id, companyId }
    });

    if (!grupoServico) {
      return res.status(404).json({ error: "Grupo de serviço não encontrado" });
    }

    await grupoServico.update({
      tipoServicoId,
      nome,
      codigo,
      descricao,
      ativo
    });

    return res.status(200).json(grupoServico);
  } catch (error) {
    console.error("Erro ao atualizar grupo de serviço:", error);
    return res.status(500).json({ error: "Erro ao atualizar grupo de serviço" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const grupoServico = await GrupoServico.findOne({
      where: { id, companyId }
    });

    if (!grupoServico) {
      return res.status(404).json({ error: "Grupo de serviço não encontrado" });
    }

    await grupoServico.destroy();

    return res.status(200).json({ message: "Grupo de serviço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover grupo de serviço:", error);
    return res.status(500).json({ error: "Erro ao remover grupo de serviço" });
  }
};
