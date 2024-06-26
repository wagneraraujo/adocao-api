import mongoose, { Mongoose, Document } from "mongoose";

const { Schema } = mongoose;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image: string;
  phone: string;
}

const User = mongoose.model(
  "User",
  new Schema<IUser>(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      image: { type: String, required: true },
      phone: { type: String, required: true },
    },
    { timestamps: true },
  ),
);

export default User;
