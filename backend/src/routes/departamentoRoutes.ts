import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as DepartamentoController from "../controllers/DepartamentoController";

const departamentoRoutes = Router();

departamentoRoutes.get(
  "/departamentos/users",
  isAuth,
  DepartamentoController.listUsers
);

departamentoRoutes.get(
  "/departamentos",
  isAuth,
  DepartamentoController.listDepartamentos
);

departamentoRoutes.get(
  "/departamentos/:id",
  isAuth,
  DepartamentoController.showDepartamento
);

departamentoRoutes.post(
  "/departamentos",
  isAuth,
  DepartamentoController.createDepartamento
);

departamentoRoutes.put(
  "/departamentos/:id",
  isAuth,
  DepartamentoController.updateDepartamento
);

departamentoRoutes.delete(
  "/departamentos/:id",
  isAuth,
  DepartamentoController.deleteDepartamento
);

export default departamentoRoutes;
