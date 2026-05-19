import express from "express";
import isAuth from "../middleware/isAuth";

import * as CrmTaxRegimeController from "../controllers/CrmTaxRegimeController";

const crmTaxRegimeRoutes = express.Router();

crmTaxRegimeRoutes.get("/crm/tax-regimes", isAuth, CrmTaxRegimeController.index);
crmTaxRegimeRoutes.post("/crm/tax-regimes", isAuth, CrmTaxRegimeController.store);
crmTaxRegimeRoutes.get("/crm/tax-regimes/:id", isAuth, CrmTaxRegimeController.show);
crmTaxRegimeRoutes.put("/crm/tax-regimes/:id", isAuth, CrmTaxRegimeController.update);
crmTaxRegimeRoutes.delete("/crm/tax-regimes/:id", isAuth, CrmTaxRegimeController.remove);

export default crmTaxRegimeRoutes;
