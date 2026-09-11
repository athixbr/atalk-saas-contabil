import express from "express";
import isAuth from "../middleware/isAuth";
import * as NfeXmlController from "../controllers/NfeXmlController";

const nfeXmlRoutes = express.Router();

nfeXmlRoutes.get("/nfe-xml", isAuth, NfeXmlController.index);
nfeXmlRoutes.get("/nfe-xml/:id", isAuth, NfeXmlController.show);
nfeXmlRoutes.post(
  "/nfe-xml/upload",
  isAuth,
  NfeXmlController.upload.array("files", 50),
  NfeXmlController.store
);
nfeXmlRoutes.put("/nfe-xml/:id/cliente", isAuth, NfeXmlController.updateCliente);
nfeXmlRoutes.delete("/nfe-xml/:id", isAuth, NfeXmlController.remove);
nfeXmlRoutes.get("/nfe-xml/:id/download", isAuth, NfeXmlController.downloadXml);

export default nfeXmlRoutes;
