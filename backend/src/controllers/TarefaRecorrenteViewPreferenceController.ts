import { Request, Response } from "express";
import TarefaRecorrenteViewPreference from "../models/TarefaRecorrenteViewPreference";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  const preferences = await TarefaRecorrenteViewPreference.findAll({
    where: { userId, companyId },
    order: [
      ["isDefault", "DESC"],
      ["name", "ASC"],
    ],
  });

  return res.status(200).json(preferences);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;

  const preference = await TarefaRecorrenteViewPreference.findOne({
    where: { id: preferenceId, userId, companyId },
  });

  if (!preference) {
    return res.status(404).json({ error: "Preferência não encontrada" });
  }

  return res.status(200).json(preference);
};

export const getDefault = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  const preference = await TarefaRecorrenteViewPreference.findOne({
    where: { userId, companyId, isDefault: true },
  });

  if (!preference) {
    return res.status(404).json({ error: "Preferência padrão não encontrada" });
  }

  return res.status(200).json(preference);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { name, columns, filters, sortConfig, isDefault } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  if (!columns || !Array.isArray(columns)) {
    return res.status(400).json({ error: "Configuração de colunas é obrigatória" });
  }

  const existing = await TarefaRecorrenteViewPreference.findOne({
    where: { userId, companyId, name: name.trim() },
  });

  if (existing) {
    return res.status(400).json({ error: "Já existe uma preferência com este nome" });
  }

  if (isDefault) {
    await TarefaRecorrenteViewPreference.update(
      { isDefault: false },
      { where: { userId, companyId, isDefault: true } }
    );
  }

  const preference = await TarefaRecorrenteViewPreference.create({
    userId,
    companyId,
    name: name.trim(),
    columns,
    filters: filters || {},
    sortConfig: sortConfig || { key: "createdAt", direction: "desc" },
    isDefault: isDefault || false,
  });

  return res.status(201).json(preference);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;
  const { name, columns, filters, sortConfig, isDefault } = req.body;

  const preference = await TarefaRecorrenteViewPreference.findOne({
    where: { id: preferenceId, userId, companyId },
  });

  if (!preference) {
    return res.status(404).json({ error: "Preferência não encontrada" });
  }

  if (isDefault && !preference.isDefault) {
    await TarefaRecorrenteViewPreference.update(
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
};

export const setDefault = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;

  const preference = await TarefaRecorrenteViewPreference.findOne({
    where: { id: preferenceId, userId, companyId },
  });

  if (!preference) {
    return res.status(404).json({ error: "Preferência não encontrada" });
  }

  await TarefaRecorrenteViewPreference.update(
    { isDefault: false },
    { where: { userId, companyId, isDefault: true } }
  );
  await preference.update({ isDefault: true });

  return res.status(200).json(preference);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { preferenceId } = req.params;

  const preference = await TarefaRecorrenteViewPreference.findOne({
    where: { id: preferenceId, userId, companyId },
  });

  if (!preference) {
    return res.status(404).json({ error: "Preferência não encontrada" });
  }

  await preference.destroy();

  return res.status(200).json({ message: "Preferência excluída com sucesso" });
};
