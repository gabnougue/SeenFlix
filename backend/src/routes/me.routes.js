import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { favoritesService } from "../services/favorites.service.js";
import { validate } from "../validation/validate.middleware.js";
import { favoriteCreateSchema } from "../validation/favorite.schema.js";

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
 *       401:
 *         description: Non authentifié ou token invalide/expiré
 */
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

/**
 * @openapi
 * /me/favorites:
 *   get:
 *     summary: Liste tous les favoris de l'utilisateur
 *     tags:
 *       - Favoris
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des favoris
 *       401:
 *         description: Non authentifié
 */
router.get("/favorites", authenticateToken, async (req, res, next) => {
  try {
    const favorites = await favoritesService.getUserFavorites(req.user.id);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /me/favorites:
 *   post:
 *     summary: Ajoute un favori
 *     tags:
 *       - Favoris
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tmdbId
 *               - type
 *             properties:
 *               tmdbId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [movie, tv]
 *               rating:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Favori créé
 *       400:
 *         description: Validation échouée
 *       409:
 *         description: Favori déjà existant
 */
router.post("/favorites", authenticateToken, validate(favoriteCreateSchema), async (req, res, next) => {
  try {
    const favorite = await favoritesService.addFavorite(req.user.id, req.body);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /me/favorites/{id}:
 *   delete:
 *     summary: Supprime un favori
 *     tags:
 *       - Favoris
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Favori supprimé
 *       404:
 *         description: Favori non trouvé
 *       403:
 *         description: Accès interdit
 */
router.delete("/favorites/:id", authenticateToken, async (req, res, next) => {
  try {
    const favoriteId = parseInt(req.params.id, 10);
    
    if (isNaN(favoriteId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    await favoritesService.deleteFavorite(favoriteId, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
