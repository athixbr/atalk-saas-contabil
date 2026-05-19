import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import CreateService from "../services/KnowledgeBaseServices/CategoryServices/CreateService";
import ListService from "../services/KnowledgeBaseServices/CategoryServices/ListService";
import UpdateService from "../services/KnowledgeBaseServices/CategoryServices/UpdateService";
import ShowService from "../services/KnowledgeBaseServices/CategoryServices/ShowService";
import DeleteService from "../services/KnowledgeBaseServices/CategoryServices/DeleteService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { categories, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ categories, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description, parentId, icon, color, order } = req.body;
  const { companyId } = req.user;

  if (!name) {
    throw new AppError("ERR_CATEGORY_NAME_REQUIRED", 400);
  }

  const category = await CreateService({
    name,
    description,
    parentId,
    icon,
    color,
    order,
    companyId
  });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseCategory`, {
    action: "create",
    category
  });

  return res.status(200).json(category);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;
  const { companyId } = req.user;

  const category = await ShowService({ id: categoryId, companyId });

  return res.status(200).json(category);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;
  const categoryData = req.body;
  const { companyId } = req.user;

  const category = await UpdateService({ 
    categoryData, 
    id: categoryId,
    companyId 
  });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseCategory`, {
    action: "update",
    category
  });

  return res.status(200).json(category);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;
  const { companyId } = req.user;

  await DeleteService({ id: categoryId, companyId });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseCategory`, {
    action: "delete",
    categoryId
  });

  return res.status(200).json({ message: "Category deleted" });
};
