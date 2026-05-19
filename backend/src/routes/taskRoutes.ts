import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as TaskController from "../controllers/TaskController";

const taskRoutes = express.Router();
const upload = multer(uploadConfig);

taskRoutes.get("/tasks", isAuth, TaskController.index);

taskRoutes.get("/tasks/stats/:userId?", isAuth, TaskController.getUserStats);

taskRoutes.post("/tasks", isAuth, TaskController.store);

taskRoutes.put("/tasks/:taskId", isAuth, TaskController.update);

taskRoutes.get("/tasks/:taskId", isAuth, TaskController.show);

taskRoutes.post("/tasks/:taskId/transfer", isAuth, TaskController.transfer);

taskRoutes.put("/tasks/:taskId/checklist", isAuth, TaskController.updateChecklist);

taskRoutes.get("/tasks/:taskId/history", isAuth, TaskController.history);

taskRoutes.put("/tasks/history/:historyId", isAuth, TaskController.updateHistory);

taskRoutes.delete("/tasks/history/:historyId", isAuth, TaskController.deleteHistory);

// Rotas para arquivos
taskRoutes.post("/tasks/:taskId/upload", isAuth, upload.array("files"), TaskController.uploadFile);

taskRoutes.get("/tasks/:taskId/files", isAuth, TaskController.listFiles);

taskRoutes.delete("/tasks/:taskId/files/:fileName", isAuth, TaskController.deleteFile);

taskRoutes.delete("/tasks/:taskId", isAuth, TaskController.remove);

export default taskRoutes;
