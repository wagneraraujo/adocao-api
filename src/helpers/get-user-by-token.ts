import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";

const getUserByToken = async (token: any | undefined) => {
  if (!token) {
    throw new Error("Token não fornecido"); // Ou retorne null, dependendo da sua lógica
  }
  const verified: any = jwt.verify(token, "lauraalves") as JwtPayload;
  const userId = verified.id;

  const user = await User.findOne({ _id: userId });
  return user;
};

export default getUserByToken;
