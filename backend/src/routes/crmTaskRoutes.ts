import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmTaskController from "../controllers/CrmTaskController";

const crmTaskRoutes = express.Router();

crmTaskRoutes.get("/crm/tasks", isAuth, CrmTaskController.index);
crmTaskRoutes.post("/crm/tasks", isAuth, CrmTaskController.store);
crmTaskRoutes.get("/crm/tasks/:id", isAuth, CrmTaskController.show);
crmTaskRoutes.put("/crm/tasks/:id", isAuth, CrmTaskController.update);
crmTaskRoutes.delete("/crm/tasks/:id", isAuth, CrmTaskController.remove);

export default crmTaskRoutes;
