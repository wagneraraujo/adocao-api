import { StatusCodes } from "http-status-codes";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  name: string;
  id: string;
}

interface Token {
  token: string;
  userId: string;
}

const createToken = async (
  user: any,
  req: Request,
  res: Response,
): Promise<Token> => {
  const token = jwt.sign(
    {
      name: user.name,
      id: user.id,
    } as TokenPayload,
    "lauraalves",
  );

  const response: Token = {
    token,
    userId: user._id,
  };

  res.status(StatusCodes.OK).json(response);
  return response;
};

export default createToken;
