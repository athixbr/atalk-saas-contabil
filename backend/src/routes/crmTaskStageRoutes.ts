import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CrmTaskStageController from "../controllers/CrmTaskStageController";

const crmTaskStageRoutes = Router();

crmTaskStageRoutes.get("/crm/task-stages", isAuth, CrmTaskStageController.index);
crmTaskStageRoutes.post("/crm/task-stages", isAuth, CrmTaskStageController.store);
crmTaskStageRoutes.put("/crm/task-stages/:stageId", isAuth, CrmTaskStageController.update);
crmTaskStageRoutes.delete("/crm/task-stages/:stageId", isAuth, CrmTaskStageController.remove);

export default crmTaskStageRoutes;
