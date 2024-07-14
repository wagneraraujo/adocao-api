import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import createToken from "../helpers/createToken";
import getUserByToken from "../helpers/get-user-by-token";
import getToken from "../helpers/getToken";
import jwt from "jsonwebtoken";
import { Types, isValidObjectId } from "mongoose";

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  image: z.string().optional(),
  phone: z.string(),
});

const authSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    const message = issue.message;
    return { path, message };
  });
}

type UserType = z.infer<typeof userSchema>;
type AuthType = z.infer<typeof authSchema>;
const partialUserSchema = userSchema.partial();
const UserController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validationData = userSchema.parse(req.body);
      req.body = validationData as UserType;

      //if exist user
      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        res.status(StatusCodes.CONFLICT).json({ message: "Usuário já existe" });
        return;
      }

      //create y

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(req.body.password, salt);

      //create
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.body.image,
        password: passwordHash,
      });

      try {
        const newUser = await user.save();
        await createToken(newUser, req, res);
        // res
        //   .status(StatusCodes.CREATED)
        //   .json({ message: "Usuário criado com sucesso", newUser });
      } catch (error) {
        console.error("Erro ao salvar o usuário:", error);
        res.status(StatusCodes.BAD_REQUEST).json({ message: error });
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorZod = formatZodErrors(error);
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errorZod });
      } else {
        return res.status(500).json({ error: "erro inesperado de servidor" });
      }
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    console.log("login");
    try {
      const { email, password } = req.body;
      const validationAuth = authSchema.parse(req.body);
      req.body = validationAuth as AuthType;

      const user = await User.findOne({ email: email });
      if (!user) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Usuário não encontrado" });
        return;
      }

      //check passworad
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Senha inválida" });
        return;
      }

      await createToken(user, req, res);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ errors: error.errors });
      }

      console.error("Erro no login:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Erro interno do servidor" });
    }
  },

  async checkUser(req: Request, res: Response, next: NextFunction) {
    let currentUser: any;
    const header = req.headers.authorization;
    if (header) {
      const token: any = getToken(req, res, next);
      const decoded: any = jwt.verify(token, "lauraalves");
      currentUser = await User.findById(decoded?.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(StatusCodes.OK).send(currentUser);
  },

  async getUserById(req: Request, res: Response) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ message: "Usuário não encontrado" });
    }

    res.status(StatusCodes.OK).json({ user });
  },

  async editUser(req: Request, res: Response, next: NextFunction) {
    const id = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(id)) {
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ message: "Esse ID de usuário não é valido" });
    }

    const token: any = getToken(req, res, next);
    console.log("token edit", token);
    //substituir o json por  forrmdata
    console.log(req?.file, "-=----");
    const user: any = await getUserByToken(token);
    // if (req.file) {
    //   user.image = req.file.filename;
    // }
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Usuário não encontrado" });
    }
    const validationDataEdit = partialUserSchema.parse(req.body);
    console.log("validationDataEdit", validationDataEdit);
    Object.assign(user, validationDataEdit);

    const userExist = await User.findOne({ email: user?.email });
    console.log("userExist", userExist);

    if (user.email !== userExist?.email) {
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ message: "Emails são diferentes, verifique" });
    }

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Usuário não encontrado" });
    }

    try {
      const updateUser = await User.findOneAndUpdate(
        { _id: user.id },
        { $set: user },
        { new: true },
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Algo deu errado" + error });
    }
  },
};

export default UserController;
