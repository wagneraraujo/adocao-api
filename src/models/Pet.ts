import mongoose, { Document } from "mongoose";
import { IUser } from "./User";

const { Schema } = mongoose;

interface IPet extends Document {
  name: string;
  age: Number;
  weight: Number;
  color: string;
  images: any;
  available: boolean;
  user: IUser;
  adopter: Object;
}

const Pet = mongoose.model(
  "Pet",
  new Schema<IPet>(
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      weight: { type: Number, required: true },
      images: { type: Array },
      available: { type: Boolean, required: true },
      user: { type: Object },
      adopter: { type: Object },
    },
    { timestamps: true },
  ),
);

export default Pet;
