import express from "express";
import isAuth from "../middleware/isAuth";

import * as AnnouncementController from "../controllers/AnnouncementController";
import multer from "multer";
import uploadConfig from "../config/upload";
import uploadFilesToStorage from "../middleware/uploadToStorage";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/announcements/list", isAuth, AnnouncementController.findList);
routes.get("/announcements/admin/notifications", isAuth, AnnouncementController.adminNotifications);
routes.get("/announcements", isAuth, AnnouncementController.index);
routes.patch("/announcements/:id/dismiss", isAuth, AnnouncementController.dismiss);
routes.patch("/announcements/:id/read", isAuth, AnnouncementController.markRead);
routes.get("/announcements/:id", isAuth, AnnouncementController.show);
routes.post("/announcements", isAuth, AnnouncementController.store);
routes.put("/announcements/:id", isAuth,  upload.array("file"), uploadFilesToStorage, AnnouncementController.update);
routes.delete("/announcements/:id", isAuth, AnnouncementController.remove);
routes.post("/announcements/:id/media-upload", isAuth, upload.array("file"), uploadFilesToStorage, AnnouncementController.mediaUpload);
routes.delete("/announcements/:id/media-upload", isAuth, AnnouncementController.deleteMedia);

export default routes;
