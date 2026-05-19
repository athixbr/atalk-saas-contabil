import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmLeadController from "../controllers/CrmLeadController";

const crmLeadRoutes = express.Router();

crmLeadRoutes.get("/crm/leads", isAuth, CrmLeadController.index);
crmLeadRoutes.post("/crm/leads", isAuth, CrmLeadController.store);
crmLeadRoutes.get("/crm/leads/:id", isAuth, CrmLeadController.show);
crmLeadRoutes.put("/crm/leads/:id", isAuth, CrmLeadController.update);
crmLeadRoutes.delete("/crm/leads/:id", isAuth, CrmLeadController.remove);

export default crmLeadRoutes;
