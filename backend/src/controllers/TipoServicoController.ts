import { Request, Response } from "express";
import TipoServico from "../models/TipoServico";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    
    const tiposServico = await TipoServico.findAll({
      where: { companyId },
      order: [["nome", "ASC"]]
    });

    return res.status(200).json(tiposServico);
  } catch (error) {
    console.error("Erro ao listar tipos de serviço:", error);
    return res.status(500).json({ error: "Erro ao listar tipos de serviço" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const tipoServico = await TipoServico.findOne({
      where: { id, companyId }
    });

    if (!tipoServico) {
      return res.status(404).json({ error: "Tipo de serviço não encontrado" });
    }

    return res.status(200).json(tipoServico);
  } catch (error) {
    console.error("Erro ao buscar tipo de serviço:", error);
    return res.status(500).json({ error: "Erro ao buscar tipo de serviço" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { nome, codigo, descricao, ativo } = req.body;

    const tipoServico = await TipoServico.create({
      companyId,
      nome,
      codigo,
      descricao,
      ativo
    });

    return res.status(201).json(tipoServico);
  } catch (error) {
    console.error("Erro ao criar tipo de serviço:", error);
    return res.status(500).json({ error: "Erro ao criar tipo de serviço" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { nome, codigo, descricao, ativo } = req.body;

    const tipoServico = await TipoServico.findOne({
      where: { id, companyId }
    });

    if (!tipoServico) {
      return res.status(404).json({ error: "Tipo de serviço não encontrado" });
    }

    await tipoServico.update({
      nome,
      codigo,
      descricao,
      ativo
    });

    return res.status(200).json(tipoServico);
  } catch (error) {
    console.error("Erro ao atualizar tipo de serviço:", error);
    return res.status(500).json({ error: "Erro ao atualizar tipo de serviço" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const tipoServico = await TipoServico.findOne({
      where: { id, companyId }
    });

    if (!tipoServico) {
      return res.status(404).json({ error: "Tipo de serviço não encontrado" });
    }

    await tipoServico.destroy();

    return res.status(200).json({ message: "Tipo de serviço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover tipo de serviço:", error);
    return res.status(500).json({ error: "Erro ao remover tipo de serviço" });
  }
};
