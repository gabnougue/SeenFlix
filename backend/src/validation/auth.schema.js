import { z } from "zod";

/**
 * registerSchema
 * - email : string valid email
 * - password : string min 6 chars (ajuste si besoin)
 */
export const registerSchema = z.object({
  email: z.email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

/**
 * loginSchema
 * - email : string email
 * - password : string (on autorise >0, la règle stricte est déjà faite côté register)
 */
export const loginSchema = z.object({
  email: z.email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});
