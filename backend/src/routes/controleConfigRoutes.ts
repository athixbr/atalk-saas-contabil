import express from "express";
import isAuth from "../middleware/isAuth";
import * as ControleConfigController from "../controllers/ControleConfigController";

const controleConfigRoutes = express.Router();

controleConfigRoutes.get(
  "/controles-config",
  isAuth,
  ControleConfigController.index
);

controleConfigRoutes.get(
  "/controles-config/:controleConfigId",
  isAuth,
  ControleConfigController.show
);

controleConfigRoutes.post(
  "/controles-config",
  isAuth,
  ControleConfigController.store
);

controleConfigRoutes.put(
  "/controles-config/:controleConfigId",
  isAuth,
  ControleConfigController.update
);

controleConfigRoutes.delete(
  "/controles-config/:controleConfigId",
  isAuth,
  ControleConfigController.remove
);

export default controleConfigRoutes;
