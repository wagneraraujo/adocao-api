import jwt from "jsonwebtoken";

import User from "../models/User";
import { StatusCodes } from "http-status-codes";

const getUserByToken = async (token: string) => {
  if (!token) {
    return;
  }

  const verified: any = jwt.verify(token, "lauraalves");

  const userId = verified.id;

  const user = await User.findOne({ _id: userId });
  console.log("user getuyserbytoken", user);
  return user;
};

export default getUserByToken;
