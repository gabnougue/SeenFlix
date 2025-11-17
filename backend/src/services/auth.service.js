import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function registerUser(email, password) {
  // Vérifier si l'utilisateur existe déjà
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_ALREADY_USED");
  }

  // Hasher le mot de passe
  const hash = await bcrypt.hash(password, 10);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
    },
  });

  return user;
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Générer les tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TTL }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TTL }
  );

  return { accessToken, refreshToken, user };
}
