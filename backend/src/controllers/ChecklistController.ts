import { Request, Response } from "express";
import CreateChecklistService from "../services/ChecklistServices/CreateChecklistService";
import ListChecklistsService from "../services/ChecklistServices/ListChecklistsService";
import ShowChecklistService from "../services/ChecklistServices/ShowChecklistService";
import UpdateChecklistService from "../services/ChecklistServices/UpdateChecklistService";
import DeleteChecklistService from "../services/ChecklistServices/DeleteChecklistService";
import DigitalOceanService from "../services/DigitalOceanService";
import ChecklistItem from "../models/ChecklistItem";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { searchParam, ativo, page = "1", pageSize = "20" } = req.query as any;

    const result = await ListChecklistsService({
      companyId,
      searchParam,
      ativo: ativo !== undefined ? ativo === "true" : undefined,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10)
    });

    return res.json(result);
  } catch (error) {
    console.error("Erro ao listar checklists:", error);
    return res.status(500).json({ error: error.message || "Erro ao listar checklists" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const checklist = await ShowChecklistService({
      id: parsedId,
      companyId
    });

    return res.json(checklist);
  } catch (error) {
    console.error("Erro ao buscar checklist:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao buscar checklist" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user;
    const { titulo, descricao, tipo, ativo, itens } = req.body;

    const checklist = await CreateChecklistService({
      companyId,
      userId: Number(userId),
      titulo,
      descricao,
      tipo,
      ativo,
      itens
    });

    return res.status(201).json(checklist);
  } catch (error) {
    console.error("Erro ao criar checklist:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao criar checklist" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user;
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { titulo, descricao, tipo, ativo, itens } = req.body;

    const checklist = await UpdateChecklistService({
      id: parsedId,
      companyId,
      userId: Number(userId),
      titulo,
      descricao,
      tipo,
      ativo,
      itens
    });

    return res.json(checklist);
  } catch (error) {
    console.error("Erro ao atualizar checklist:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao atualizar checklist" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await DeleteChecklistService({
      id: parsedId,
      companyId
    });

    return res.json({ message: "Checklist deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar checklist:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao deletar checklist" });
  }
};

export const uploadFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { checklistId, itemId } = req.params;

    if (!req.file) {
      throw new AppError("ERR_NO_FILE_PROVIDED", 400);
    }

    // Verificar se o item existe
    const item = await ChecklistItem.findOne({
      where: { id: itemId, checklistId }
    });

    if (!item) {
      throw new AppError("ERR_CHECKLIST_ITEM_NOT_FOUND", 404);
    }

    // Preparar path no Digital Ocean
    const fileName = `${Date.now()}-${req.file.originalname}`;

    // Upload para Digital Ocean
    const uploadResult = await DigitalOceanService.upload({
      companyId,
      folder: "checklists",
      file: req.file.buffer,
      fileName: `${checklistId}/${fileName}`,
      isPublic: true
    });

    // Deletar arquivo antigo se existir
    if (item.arquivoPath) {
      try {
        await DigitalOceanService.delete(item.arquivoPath);
      } catch (error) {
        console.error("Erro ao deletar arquivo antigo:", error);
      }
    }

    // Atualizar item com novo arquivo
    await item.update({
      arquivoUrl: uploadResult.url,
      arquivoNome: req.file.originalname,
      arquivoPath: uploadResult.path
    });

    return res.json({
      url: uploadResult.url,
      path: uploadResult.path,
      nome: req.file.originalname
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao fazer upload" });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { itemId } = req.params;

    const item = await ChecklistItem.findByPk(itemId);

    if (!item) {
      throw new AppError("ERR_CHECKLIST_ITEM_NOT_FOUND", 404);
    }

    // Deletar arquivo do Digital Ocean
    if (item.arquivoPath) {
      try {
        await DigitalOceanService.delete(item.arquivoPath);
      } catch (error) {
        console.error("Erro ao deletar arquivo:", error);
      }
    }

    // Limpar campos de arquivo do item
    await item.update({
      arquivoUrl: null,
      arquivoNome: null,
      arquivoPath: null
    });

    return res.json({ message: "Arquivo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return res.status(error.statusCode || 500).json({ error: error.message || "Erro ao deletar arquivo" });
  }
};
