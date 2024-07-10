import jwt from "jsonwebtoken";

import User from "../models/User";
import { StatusCodes } from "http-status-codes";

const getUserByToken = async (token: string | undefined) => {
  if (!token) {
    throw new Error("Token não fornecido"); // Ou retorne null, dependendo da sua lógica
  }
  const verified: any = jwt.verify(token, "lauraalves");
  console.log(verified, "============ ============= ======== ========");

  const userId = verified.id;

  const user = await User.findOne({ _id: userId });
  console.log("user getuyserbytoken", user);
  return user;
};

export default getUserByToken;
