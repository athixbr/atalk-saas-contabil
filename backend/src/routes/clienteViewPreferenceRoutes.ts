import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ClienteViewPreferenceController from "../controllers/ClienteViewPreferenceController";

const clienteViewPreferenceRoutes = Router();

// Listar todas as preferências do usuário
clienteViewPreferenceRoutes.get(
  "/clientes-view-preferences",
  isAuth,
  ClienteViewPreferenceController.index
);

// Buscar preferência padrão
clienteViewPreferenceRoutes.get(
  "/clientes-view-preferences/default",
  isAuth,
  ClienteViewPreferenceController.getDefault
);

// Buscar preferência específica
clienteViewPreferenceRoutes.get(
  "/clientes-view-preferences/:preferenceId",
  isAuth,
  ClienteViewPreferenceController.show
);

// Criar nova preferência
clienteViewPreferenceRoutes.post(
  "/clientes-view-preferences",
  isAuth,
  ClienteViewPreferenceController.store
);

// Atualizar preferência
clienteViewPreferenceRoutes.put(
  "/clientes-view-preferences/:preferenceId",
  isAuth,
  ClienteViewPreferenceController.update
);

// Definir como padrão
clienteViewPreferenceRoutes.patch(
  "/clientes-view-preferences/:preferenceId/set-default",
  isAuth,
  ClienteViewPreferenceController.setDefault
);

// Deletar preferência
clienteViewPreferenceRoutes.delete(
  "/clientes-view-preferences/:preferenceId",
  isAuth,
  ClienteViewPreferenceController.remove
);

export default clienteViewPreferenceRoutes;
