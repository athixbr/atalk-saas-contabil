import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CnaeController from "../controllers/CnaeController";

const cnaeRoutes = Router();

cnaeRoutes.get("/cnaes", isAuth, CnaeController.index);

export default cnaeRoutes;
