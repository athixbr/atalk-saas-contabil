import express from "express";
import isAuth from "../middleware/isAuth";

import * as BillingController from "../controllers/BillingController";

const billingRoutes = express.Router();

billingRoutes.get("/billings", isAuth, BillingController.index);
billingRoutes.post("/billings", isAuth, BillingController.store);
billingRoutes.get("/billings/:billingId", isAuth, BillingController.show);
billingRoutes.put("/billings/:billingId", isAuth, BillingController.update);
billingRoutes.delete("/billings/:billingId", isAuth, BillingController.remove);

billingRoutes.post("/billings/:billingId/history", isAuth, BillingController.addHistory);
billingRoutes.get("/billings/:billingId/history", isAuth, BillingController.getHistory);

billingRoutes.get("/billings-report", isAuth, BillingController.getReport);

export default billingRoutes;
