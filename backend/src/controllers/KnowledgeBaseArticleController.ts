import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import CreateService from "../services/KnowledgeBaseServices/ArticleServices/CreateService";
import ListService from "../services/KnowledgeBaseServices/ArticleServices/ListService";
import UpdateService from "../services/KnowledgeBaseServices/ArticleServices/UpdateService";
import ShowService from "../services/KnowledgeBaseServices/ArticleServices/ShowService";
import DeleteService from "../services/KnowledgeBaseServices/ArticleServices/DeleteService";
import IncrementViewService from "../services/KnowledgeBaseServices/ArticleServices/IncrementViewService";
import SearchService from "../services/KnowledgeBaseServices/ArticleServices/SearchService";
import FeaturedService from "../services/KnowledgeBaseServices/ArticleServices/FeaturedService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
  categoryId?: string;
  status?: string;
  userId?: string;
  featured?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, categoryId, status, userId, featured } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { articles, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    categoryId,
    status,
    userId,
    featured: featured === "true",
    companyId
  });

  return res.json({ articles, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { 
    title, 
    content, 
    summary, 
    categoryId, 
    status, 
    featured, 
    tags,
    videos 
  } = req.body;
  const { companyId } = req.user;
  const userId = Number(req.user.id);

  if (!title || !content) {
    throw new AppError("ERR_ARTICLE_TITLE_CONTENT_REQUIRED", 400);
  }

  const article = await CreateService({
    title,
    content,
    summary,
    categoryId,
    userId,
    companyId,
    status,
    featured,
    tags,
    videos
  });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseArticle`, {
    action: "create",
    article
  });

  return res.status(200).json(article);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { companyId } = req.user;

  const article = await ShowService({ id: articleId, companyId });

  return res.status(200).json(article);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const articleData = req.body;
  const { companyId } = req.user;

  const article = await UpdateService({ 
    articleData, 
    id: articleId,
    companyId 
  });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseArticle`, {
    action: "update",
    article
  });

  return res.status(200).json(article);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { companyId } = req.user;

  await DeleteService({ id: articleId, companyId });

  const io = getIO();
  io.emit(`company${companyId}-knowledgeBaseArticle`, {
    action: "delete",
    articleId
  });

  return res.status(200).json({ message: "Article deleted" });
};

export const incrementView = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { companyId } = req.user;

  await IncrementViewService({ id: articleId, companyId });

  return res.status(200).json({ message: "View incremented" });
};

export const search = async (req: Request, res: Response): Promise<Response> => {
  const { q, categoryId } = req.query as { q: string; categoryId?: string };
  const { companyId } = req.user;

  if (!q) {
    throw new AppError("ERR_SEARCH_QUERY_REQUIRED", 400);
  }

  const articles = await SearchService({
    query: q,
    categoryId,
    companyId
  });

  return res.json({ articles });
};

export const featured = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const articles = await FeaturedService({ companyId });

  return res.json({ articles });
};
