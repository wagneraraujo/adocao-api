import { Router } from "express";
import PetController from "../controllers/PetController";
import checkToken from "../helpers/verify-token";
const petRouter = Router();
petRouter.post("/create", checkToken, PetController.create);

export default petRouter;
