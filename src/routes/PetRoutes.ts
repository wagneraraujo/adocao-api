import { Router } from "express";
import PetController from "../controllers/PetController";
import checkToken from "../helpers/verify-token";
import imageUploud from "../helpers/imageUploud";
const petRouter = Router();
petRouter.post(
  "/create",
  checkToken,
  imageUploud.array("images"),
  PetController.create,
);

petRouter.get("/", PetController.getAll);

export default petRouter;
