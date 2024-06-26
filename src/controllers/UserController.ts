import User from "../models/User";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import createToken from "../helpers/createToken";

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
};

export default UserController;
