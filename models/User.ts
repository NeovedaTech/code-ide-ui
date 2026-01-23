import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default models.User || model("User", UserSchema);
