// app/actions/createUser.ts
"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function createUser(formData: FormData) {
  await connectDB();

  const name = formData.get("name");
  const email = formData.get("email");

  const user = await User.create({ name, email });
  return user;
}
