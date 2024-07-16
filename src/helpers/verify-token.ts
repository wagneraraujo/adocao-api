import { Response, Request, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import getToken from "./getToken";

//middleware for validate token
const checkToken = (req: Request, res: Response, next: NextFunction) => {
  const token = getToken(req, res, next);
  const newToken: string | any = token;
  if (!req?.headers.authorization) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Acesso negado, sem headers" });
  }

  if (!token) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Acesso negado" });
  }
  try {
    const verified = jwt.verify(newToken, "lauraalves") as JwtPayload;
    (req as any).user = verified;
    next();
  } catch (error) {
    console.log("erro checkToken", error);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Acesso negado ou token inválido" });
  }
};

export default checkToken;
