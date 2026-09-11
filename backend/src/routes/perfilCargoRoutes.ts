import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import uploadFilesToStorage from "../middleware/uploadToStorage";
import * as PerfilCargoController from "../controllers/PerfilCargoController";
import * as HoleriteController from "../controllers/HoleriteController";

const upload = multer(uploadConfig);
const perfilCargoRoutes = Router();

// Rotas de Perfil de Cargo
perfilCargoRoutes.get(
  "/perfil-cargo/:userId",
  isAuth,
  PerfilCargoController.show
);

perfilCargoRoutes.post(
  "/perfil-cargo/:userId",
  isAuth,
  PerfilCargoController.store
);

// Rotas de Holerites
perfilCargoRoutes.get(
  "/holerites/:userId",
  isAuth,
  HoleriteController.index
);

perfilCargoRoutes.get(
  "/holerites/download/:holeriteId",
  isAuth,
  HoleriteController.download
);

perfilCargoRoutes.post(
  "/holerites/:userId",
  isAuth,
  upload.single("file"),
  uploadFilesToStorage,
  HoleriteController.store
);

perfilCargoRoutes.delete(
  "/holerites/:holeriteId",
  isAuth,
  HoleriteController.remove
);

export default perfilCargoRoutes;
