import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import createToken from "../helpers/createToken";
import getUserByToken from "../helpers/get-user-by-token";
import getToken from "../helpers/getToken";
import jwt from "jsonwebtoken";
import { Types, isValidObjectId } from "mongoose";
import Pet from "../models/Pet";
import formatZodErrors from "../helpers/formatZodErro";

const petSchema = z.object({
  name: z.string().default("Precisa preencher o nome"),
  age: z.number().int().positive().or(z.string()),
  weight: z
    .number()
    .positive("O peso deve ser um número positivo.")
    .or(z.string()),
  color: z.string(),
  images: z.any(),
  available: z.enum(["true", "false"]),
  user: z.any(),
  adopter: z.any(),
});

type PetType = z.infer<typeof petSchema>;

const PetController = {
  async create(req: Request, res: Response, next: NextFunction) {
    const validationBody = petSchema.parse(req.body);
    const available = true;
    console.log("validationBody", validationBody);

    const token = getToken(req, res, next);
    const user: any = await getUserByToken(token);
    if (!user)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Usuário não encontrado" });

    //pet
    const { name, age, weight, color } = req.body;
    const images = req.files;
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: images,
      user: {
        _id: user.id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });
    try {
      const newPet = await pet.save();
      res
        .status(StatusCodes.OK)
        .json({ message: "Pet criado com sucesso!", newPet });
      console.log("salvo com sucesso");
    } catch (error) {
      console.log("error");
      if (error instanceof z.ZodError) {
        const errorZod = formatZodErrors(error);
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errorZod });
      } else {
        return res.status(500).json({ error: "erro inesperado de servidor" });
      }
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    const pets = await Pet.find().sort("-createdAt");
    res.status(StatusCodes.OK).json({
      message: "Tudo certo, ",
      pets,
    });
  },

  async getAllUserPets(req: Request, res: Response, next: NextFunction) {
    //user
    const token = getToken(req, res, next);
    const user = await getUserByToken(token);

    const pets = await Pet.find({
      "user._id": user?._id,
    }).sort("-createdAt");

    res
      .status(StatusCodes.OK)
      .json({ message: "Todos pet do usuario encontrado", pets });
  },

  async getAllUserAdoptions(req: Request, res: Response, next: NextFunction) {
    //user
    const token = getToken(req, res, next);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "adopter._id": user?._id }).sort(
      "-createdAt",
    );

    res.status(StatusCodes.OK).json({ pets });
  },

  async getPerById(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Id invalido" });
      return;
    }

    //get
    const pet = await Pet.findOne({ _id: id });
    if (!pet)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "não encontrado" });

    res.status(StatusCodes.OK).json({ pet: pet });
  },
};

export default PetController;
