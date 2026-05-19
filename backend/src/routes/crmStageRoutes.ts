import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmStageController from "../controllers/CrmStageController";

const crmStageRoutes = express.Router();

crmStageRoutes.get("/crm/stages", isAuth, CrmStageController.index);
crmStageRoutes.post("/crm/stages", isAuth, CrmStageController.store);
crmStageRoutes.get("/crm/stages/:id", isAuth, CrmStageController.show);
crmStageRoutes.put("/crm/stages/:id", isAuth, CrmStageController.update);
crmStageRoutes.delete("/crm/stages/:id", isAuth, CrmStageController.remove);

export default crmStageRoutes;
