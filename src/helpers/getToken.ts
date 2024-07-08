import { Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
const getToken = (req: Request, res: Response) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader)
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Sem token no header" });
  const token = authHeader?.split(" ")[1];
  return token;
};

export default getToken;
