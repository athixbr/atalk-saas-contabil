import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmTaskCategoryController from "../controllers/CrmTaskCategoryController";

const crmTaskCategoryRoutes = express.Router();

crmTaskCategoryRoutes.get("/crm/task-categories", isAuth, CrmTaskCategoryController.index);
crmTaskCategoryRoutes.post("/crm/task-categories", isAuth, CrmTaskCategoryController.store);
crmTaskCategoryRoutes.get("/crm/task-categories/:id", isAuth, CrmTaskCategoryController.show);
crmTaskCategoryRoutes.put("/crm/task-categories/:id", isAuth, CrmTaskCategoryController.update);
crmTaskCategoryRoutes.delete("/crm/task-categories/:id", isAuth, CrmTaskCategoryController.remove);

export default crmTaskCategoryRoutes;
