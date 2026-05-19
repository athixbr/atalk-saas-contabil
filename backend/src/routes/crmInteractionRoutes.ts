import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmInteractionController from "../controllers/CrmInteractionController";

const crmInteractionRoutes = express.Router();

crmInteractionRoutes.get("/crm/interactions", isAuth, CrmInteractionController.index);
crmInteractionRoutes.post("/crm/interactions", isAuth, CrmInteractionController.store);
crmInteractionRoutes.get("/crm/interactions/:id", isAuth, CrmInteractionController.show);
crmInteractionRoutes.put("/crm/interactions/:id", isAuth, CrmInteractionController.update);
crmInteractionRoutes.delete("/crm/interactions/:id", isAuth, CrmInteractionController.remove);

export default crmInteractionRoutes;
