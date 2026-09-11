import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as TarefaRecorrenteViewPreferenceController from "../controllers/TarefaRecorrenteViewPreferenceController";

const tarefaRecorrenteViewPreferenceRoutes = Router();

tarefaRecorrenteViewPreferenceRoutes.get(
  "/tarefas-recorrentes-view-preferences",
  isAuth,
  TarefaRecorrenteViewPreferenceController.index
);

tarefaRecorrenteViewPreferenceRoutes.get(
  "/tarefas-recorrentes-view-preferences/default",
  isAuth,
  TarefaRecorrenteViewPreferenceController.getDefault
);

tarefaRecorrenteViewPreferenceRoutes.get(
  "/tarefas-recorrentes-view-preferences/:preferenceId",
  isAuth,
  TarefaRecorrenteViewPreferenceController.show
);

tarefaRecorrenteViewPreferenceRoutes.post(
  "/tarefas-recorrentes-view-preferences",
  isAuth,
  TarefaRecorrenteViewPreferenceController.store
);

tarefaRecorrenteViewPreferenceRoutes.put(
  "/tarefas-recorrentes-view-preferences/:preferenceId",
  isAuth,
  TarefaRecorrenteViewPreferenceController.update
);

tarefaRecorrenteViewPreferenceRoutes.patch(
  "/tarefas-recorrentes-view-preferences/:preferenceId/set-default",
  isAuth,
  TarefaRecorrenteViewPreferenceController.setDefault
);

tarefaRecorrenteViewPreferenceRoutes.delete(
  "/tarefas-recorrentes-view-preferences/:preferenceId",
  isAuth,
  TarefaRecorrenteViewPreferenceController.remove
);

export default tarefaRecorrenteViewPreferenceRoutes;
