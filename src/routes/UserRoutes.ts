import { Router } from "express";
import UserController from "../controllers/UserController";
import getToken from "../helpers/getToken";

const router = Router();
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/checkuser", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.patch("/edit/:id", UserController.editUser);

export { router };
