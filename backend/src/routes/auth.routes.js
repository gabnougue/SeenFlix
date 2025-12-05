import express from "express";
import { registerSchema, loginSchema } from "../validation/auth.schema.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     description: Permet à un nouvel utilisateur de s'inscrire avec une adresse email et un mot de passe
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email valide
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Mot de passe (minimum 6 caractères)
 *                 example: password123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation des données
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Email already registered
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors });
  }

  const { email, password } = parse.data;

  try {
    const user = await registerUser(email, password);
    res.status(201).json({ message: "User created", user: { id: user.id, email: user.email }});
  } catch (err) {
    console.error("REGISTER ERROR:", err); 
    if (err.message === "EMAIL_ALREADY_USED") {
      return res.status(409).json({ error: "Email already registered\n" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Se connecter à son compte
 *     description: Permet à un utilisateur existant de se connecter avec son email et mot de passe. Retourne des tokens JWT.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email du compte
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Mot de passe du compte
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   description: Token JWT d'accès (courte durée)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   description: Token JWT de rafraîchissement (longue durée)
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Erreur de validation des données
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid email or password
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors });
  }

  const { email, password } = parse.data;

  try {
    const { accessToken, refreshToken, user } = await loginUser(email, password);
    res.json({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rafraîchir un token d'accès
 *     description: Permet d'obtenir un nouveau accessToken en utilisant un refreshToken valide.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token valide
 *     responses:
 *       200:
 *         description: Nouveau accessToken généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    // Vérifier le refresh token
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // Payload contient { id: <userId> }
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Générer un nouveau access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TTL }
    );

    // nouveau refresh token
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_TTL }
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

