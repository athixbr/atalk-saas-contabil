import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as UserViewPreferenceController from "../controllers/UserViewPreferenceController";

const userViewPreferenceRoutes = Router();

userViewPreferenceRoutes.get("/users-view-preferences", isAuth, UserViewPreferenceController.index);
userViewPreferenceRoutes.get("/users-view-preferences/default", isAuth, UserViewPreferenceController.getDefault);
userViewPreferenceRoutes.get("/users-view-preferences/:preferenceId", isAuth, UserViewPreferenceController.show);
userViewPreferenceRoutes.post("/users-view-preferences", isAuth, UserViewPreferenceController.store);
userViewPreferenceRoutes.put("/users-view-preferences/:preferenceId", isAuth, UserViewPreferenceController.update);
userViewPreferenceRoutes.patch("/users-view-preferences/:preferenceId/set-default", isAuth, UserViewPreferenceController.setDefault);
userViewPreferenceRoutes.delete("/users-view-preferences/:preferenceId", isAuth, UserViewPreferenceController.remove);

export default userViewPreferenceRoutes;
