"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterSchema, RegisterInput } from "../validations/register";
import { signIn } from "@/auth";

export async function registerUser(values: RegisterInput) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Auto sign in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: "User created!" };
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return { error: "Something went wrong!" };
  }
}
