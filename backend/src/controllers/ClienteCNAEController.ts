import { Request, Response } from "express";
import ClienteCNAE from "../models/ClienteCNAE";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId } = req.params;

  try {
    const cnaes = await ClienteCNAE.findAll({
      where: { clienteId },
      order: [
        ["principal", "DESC"],
        ["createdAt", "ASC"],
      ],
    });

    return res.status(200).json(cnaes);
  } catch (err) {
    console.error("Erro ao listar CNAEs:", err);
    return res.status(500).json({ error: "Erro ao listar CNAEs" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId } = req.params;
  const { cnae, descricao, principal } = req.body;

  try {
    // Se estiver marcando como principal, desmarca os outros
    if (principal) {
      await ClienteCNAE.update(
        { principal: false },
        { where: { clienteId } }
      );
    }

    const novoCnae = await ClienteCNAE.create({
      clienteId: Number(clienteId),
      cnae,
      descricao,
      principal: principal || false,
    });

    return res.status(201).json(novoCnae);
  } catch (err) {
    console.error("Erro ao criar CNAE:", err);
    return res.status(500).json({ error: "Erro ao criar CNAE" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, cnaeId } = req.params;
  const { cnae, descricao, principal } = req.body;

  try {
    const cnaeExistente = await ClienteCNAE.findOne({
      where: { id: cnaeId, clienteId },
    });

    if (!cnaeExistente) {
      return res.status(404).json({ error: "CNAE não encontrado" });
    }

    // Se estiver marcando como principal, desmarca os outros
    if (principal && !cnaeExistente.principal) {
      await ClienteCNAE.update(
        { principal: false },
        { where: { clienteId } }
      );
    }

    await cnaeExistente.update({
      cnae,
      descricao,
      principal: principal || false,
    });

    return res.status(200).json(cnaeExistente);
  } catch (err) {
    console.error("Erro ao atualizar CNAE:", err);
    return res.status(500).json({ error: "Erro ao atualizar CNAE" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, cnaeId } = req.params;

  try {
    const cnae = await ClienteCNAE.findOne({
      where: { id: cnaeId, clienteId },
    });

    if (!cnae) {
      return res.status(404).json({ error: "CNAE não encontrado" });
    }

    await cnae.destroy();

    return res.status(200).json({ message: "CNAE excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir CNAE:", err);
    return res.status(500).json({ error: "Erro ao excluir CNAE" });
  }
};
