import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmSourceController from "../controllers/CrmSourceController";

const crmSourceRoutes = express.Router();

crmSourceRoutes.get("/crm/sources", isAuth, CrmSourceController.index);
crmSourceRoutes.post("/crm/sources", isAuth, CrmSourceController.store);
crmSourceRoutes.get("/crm/sources/:id", isAuth, CrmSourceController.show);
crmSourceRoutes.put("/crm/sources/:id", isAuth, CrmSourceController.update);
crmSourceRoutes.delete("/crm/sources/:id", isAuth, CrmSourceController.remove);

export default crmSourceRoutes;
