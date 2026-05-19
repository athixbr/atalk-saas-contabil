import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as UserClientesPreferencesController from "../controllers/UserClientesPreferencesController";

const userClientesPreferencesRoutes = Router();

// Rotas de preferências gerais do usuário
userClientesPreferencesRoutes.get(
  "/user-preferences/clientes",
  isAuth,
  UserClientesPreferencesController.getPreferences
);

userClientesPreferencesRoutes.put(
  "/user-preferences/clientes",
  isAuth,
  UserClientesPreferencesController.updatePreferences
);

userClientesPreferencesRoutes.post(
  "/user-preferences/clientes/reset",
  isAuth,
  UserClientesPreferencesController.resetPreferences
);

// Rotas de filtros salvos
userClientesPreferencesRoutes.get(
  "/user-preferences/clientes/filters",
  isAuth,
  UserClientesPreferencesController.getSavedFilters
);

userClientesPreferencesRoutes.get(
  "/user-preferences/clientes/filters/:filterId",
  isAuth,
  UserClientesPreferencesController.getSavedFilterById
);

userClientesPreferencesRoutes.post(
  "/user-preferences/clientes/filters",
  isAuth,
  UserClientesPreferencesController.createSavedFilter
);

userClientesPreferencesRoutes.put(
  "/user-preferences/clientes/filters/:filterId",
  isAuth,
  UserClientesPreferencesController.updateSavedFilter
);

userClientesPreferencesRoutes.delete(
  "/user-preferences/clientes/filters/:filterId",
  isAuth,
  UserClientesPreferencesController.deleteSavedFilter
);

userClientesPreferencesRoutes.post(
  "/user-preferences/clientes/filters/:filterId/set-default",
  isAuth,
  UserClientesPreferencesController.setDefaultFilter
);

userClientesPreferencesRoutes.post(
  "/user-preferences/clientes/filters/clear-default",
  isAuth,
  UserClientesPreferencesController.clearDefaultFilter
);

export default userClientesPreferencesRoutes;
