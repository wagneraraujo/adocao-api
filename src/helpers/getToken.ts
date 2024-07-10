import { Response, Request, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const getToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader)
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Sem token no header" });
  const token: any = req.headers.authorization?.split(" ")[1];
  if (!token || typeof token !== "string") {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token inválido ou não fornecido" });
  }

  if (!token) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Token inválido" });
  }

  const decodedToken = jwt.verify(token, "lauraalves");
  if (decodedToken) {
    return token;
  }
};

export default getToken;
