import express from "express";
import * as GedFolderController from "../controllers/GedFolderController";
import * as GedFileController from "../controllers/GedFileController";
import isAuth from "../middleware/isAuth";

const gedRoutes = express.Router();

// ============ ROTAS DE PASTAS ============
gedRoutes.get("/ged/folders", isAuth, GedFolderController.index);
gedRoutes.get("/ged/folders/:id", isAuth, GedFolderController.show);
gedRoutes.post("/ged/folders", isAuth, GedFolderController.store);
gedRoutes.put("/ged/folders/:id", isAuth, GedFolderController.update);
gedRoutes.delete("/ged/folders/:id", isAuth, GedFolderController.remove);
gedRoutes.post("/ged/folders/:id/move", isAuth, GedFolderController.move);
gedRoutes.get("/ged/folders/:id/breadcrumb", isAuth, GedFolderController.getBreadcrumb);

// ============ ROTAS DE ARQUIVOS ============
gedRoutes.get("/ged/files", isAuth, GedFileController.index);
gedRoutes.get("/ged/files/:id", isAuth, GedFileController.show);
gedRoutes.post(
  "/ged/files",
  isAuth,
  GedFileController.upload.array("files", 10),
  GedFileController.store
);
gedRoutes.put("/ged/files/:id", isAuth, GedFileController.update);
gedRoutes.delete("/ged/files/:id", isAuth, GedFileController.remove);
gedRoutes.post("/ged/files/:id/restore", isAuth, GedFileController.restore);
gedRoutes.get("/ged/files/:id/download", isAuth, GedFileController.download);
gedRoutes.get("/ged/files/:id/preview", isAuth, GedFileController.preview);
gedRoutes.post("/ged/files/:id/move", isAuth, GedFileController.move);
gedRoutes.post("/ged/files/:id/copy", isAuth, GedFileController.copy);
gedRoutes.post("/ged/files/:id/favorite", isAuth, GedFileController.toggleFavorite);

export default gedRoutes;
