import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

/**
 * @openapi
 * /me/profile:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     description: Route protégée qui retourne les informations du profil de l'utilisateur authentifié
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Accès autorisé
 *                 user:
 *                   type: object
 *                   description: Informations de l'utilisateur extraites du token JWT
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       description: ID de l'utilisateur
 *                       example: 1
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email de l'utilisateur
 *                       example: user@example.com
 *       401:
 *         description: Non authentifié ou token invalide/expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noToken:
 *                 value:
 *                   error: Token manquant
 *               invalidToken:
 *                 value:
 *                   error: Token invalide
 */
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

export default router;
