import express from "express";
import isAuth from "../middleware/isAuth";

import * as KnowledgeBaseCategoryController from "../controllers/KnowledgeBaseCategoryController";

const knowledgeBaseCategoryRoutes = express.Router();

knowledgeBaseCategoryRoutes.get("/knowledge-base/categories", isAuth, KnowledgeBaseCategoryController.index);

knowledgeBaseCategoryRoutes.post("/knowledge-base/categories", isAuth, KnowledgeBaseCategoryController.store);

knowledgeBaseCategoryRoutes.get("/knowledge-base/categories/:categoryId", isAuth, KnowledgeBaseCategoryController.show);

knowledgeBaseCategoryRoutes.put("/knowledge-base/categories/:categoryId", isAuth, KnowledgeBaseCategoryController.update);

knowledgeBaseCategoryRoutes.delete("/knowledge-base/categories/:categoryId", isAuth, KnowledgeBaseCategoryController.remove);

export default knowledgeBaseCategoryRoutes;
