import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmBusinessTypeController from "../controllers/CrmBusinessTypeController";

const crmBusinessTypeRoutes = express.Router();

crmBusinessTypeRoutes.get("/crm/business-types", isAuth, CrmBusinessTypeController.index);
crmBusinessTypeRoutes.post("/crm/business-types", isAuth, CrmBusinessTypeController.store);
crmBusinessTypeRoutes.get("/crm/business-types/:id", isAuth, CrmBusinessTypeController.show);
crmBusinessTypeRoutes.put("/crm/business-types/:id", isAuth, CrmBusinessTypeController.update);
crmBusinessTypeRoutes.delete("/crm/business-types/:id", isAuth, CrmBusinessTypeController.remove);

export default crmBusinessTypeRoutes;
