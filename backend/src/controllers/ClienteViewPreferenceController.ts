import { Request, Response } from "express";
import ClienteViewPreference from "../models/ClienteViewPreference";

// Listar todas as preferências do usuário
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  try {
    const preferences = await ClienteViewPreference.findAll({
      where: { userId, companyId },
      order: [
        ["isDefault", "DESC"],
        ["name", "ASC"],
      ],
    });

    return res.status(200).json(preferences);
  } catch (error) {
    console.error("Erro ao listar preferências:", error);
    return res.status(500).json({ error: "Erro ao listar preferências" });
  }
};

// Buscar preferência específica
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;

  try {
    const preference = await ClienteViewPreference.findOne({
      where: { id: preferenceId, userId, companyId },
    });

    if (!preference) {
      return res.status(404).json({ error: "Preferência não encontrada" });
    }

    return res.status(200).json(preference);
  } catch (error) {
    console.error("Erro ao buscar preferência:", error);
    return res.status(500).json({ error: "Erro ao buscar preferência" });
  }
};

// Buscar preferência padrão do usuário
export const getDefault = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  try {
    const preference = await ClienteViewPreference.findOne({
      where: { userId, companyId, isDefault: true },
    });

    if (!preference) {
      return res.status(404).json({ error: "Preferência padrão não encontrada" });
    }

    return res.status(200).json(preference);
  } catch (error) {
    console.error("Erro ao buscar preferência padrão:", error);
    return res.status(500).json({ error: "Erro ao buscar preferência padrão" });
  }
};

// Criar nova preferência
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { name, columns, filters, sortConfig, isDefault } = req.body;

  try {
    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({ error: "Configuração de colunas é obrigatória" });
    }

    // Verificar se já existe uma preferência com este nome
    const existing = await ClienteViewPreference.findOne({
      where: { userId, companyId, name: name.trim() },
    });

    if (existing) {
      return res.status(400).json({ error: "Já existe uma preferência com este nome" });
    }

    // Se marcar como padrão, desmarcar outras
    if (isDefault) {
      await ClienteViewPreference.update(
        { isDefault: false },
        { where: { userId, companyId, isDefault: true } }
      );
    }

    const preference = await ClienteViewPreference.create({
      userId,
      companyId,
      name: name.trim(),
      columns,
      filters: filters || {},
      sortConfig: sortConfig || { key: 'id', direction: 'desc' },
      isDefault: isDefault || false,
    });

    return res.status(201).json(preference);
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return res.status(500).json({ error: "Erro ao criar preferência" });
  }
};

// Atualizar preferência
export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;
  const { name, columns, filters, sortConfig, isDefault } = req.body;

  try {
    const preference = await ClienteViewPreference.findOne({
      where: { id: preferenceId, userId, companyId },
    });

    if (!preference) {
      return res.status(404).json({ error: "Preferência não encontrada" });
    }

    // Se está marcando como padrão, desmarcar outras
    if (isDefault && !preference.isDefault) {
      await ClienteViewPreference.update(
        { isDefault: false },
        { where: { userId, companyId, isDefault: true } }
      );
    }

    await preference.update({
      name: name !== undefined ? name.trim() : preference.name,
      columns: columns !== undefined ? columns : preference.columns,
      filters: filters !== undefined ? filters : preference.filters,
      sortConfig: sortConfig !== undefined ? sortConfig : preference.sortConfig,
      isDefault: isDefault !== undefined ? isDefault : preference.isDefault,
    });

    return res.status(200).json(preference);
  } catch (error) {
    console.error("Erro ao atualizar preferência:", error);
    return res.status(500).json({ error: "Erro ao atualizar preferência" });
  }
};

// Definir como padrão
export const setDefault = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;

  try {
    const preference = await ClienteViewPreference.findOne({
      where: { id: preferenceId, userId, companyId },
    });

    if (!preference) {
      return res.status(404).json({ error: "Preferência não encontrada" });
    }

    // Desmarcar outras como padrão
    await ClienteViewPreference.update(
      { isDefault: false },
      { where: { userId, companyId, isDefault: true } }
    );

    // Marcar esta como padrão
    await preference.update({ isDefault: true });

    return res.status(200).json(preference);
  } catch (error) {
    console.error("Erro ao definir preferência padrão:", error);
    return res.status(500).json({ error: "Erro ao definir preferência padrão" });
  }
};

// Deletar preferência
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;

  try {
    const preference = await ClienteViewPreference.findOne({
      where: { id: preferenceId, userId, companyId },
    });

    if (!preference) {
      return res.status(404).json({ error: "Preferência não encontrada" });
    }

    await preference.destroy();

    return res.status(200).json({ message: "Preferência excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir preferência:", error);
    return res.status(500).json({ error: "Erro ao excluir preferência" });
  }
};
