import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import * as ChecklistController from "../controllers/ChecklistController";

const checklistRoutes = Router();
const upload = multer({ limits: { fileSize: 500 * 1024 * 1024 } }); // 500 MB

// Rotas CRUD
checklistRoutes.get("/checklists", isAuth, ChecklistController.index);
checklistRoutes.get("/checklists/:id", isAuth, ChecklistController.show);
checklistRoutes.post("/checklists", isAuth, ChecklistController.store);
checklistRoutes.put("/checklists/:id", isAuth, ChecklistController.update);
checklistRoutes.delete("/checklists/:id", isAuth, ChecklistController.remove);

// Rotas de upload
checklistRoutes.post(
  "/checklists/:checklistId/item/:itemId/upload",
  isAuth,
  upload.single("file"),
  ChecklistController.uploadFile
);

checklistRoutes.delete(
  "/checklists/item/:itemId/file",
  isAuth,
  ChecklistController.deleteFile
);

export default checklistRoutes;
