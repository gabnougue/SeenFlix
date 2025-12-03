import express from "express";
import axios from "axios";
import cache from "../utils/cache.js";

import { validate } from "../validation/validate.middleware.js";
import { movieSearchSchema } from "../validation/movie.schema.js";

const router = express.Router();

/**
 * @openapi
 * /movies/search:
 *   get:
 *     summary: Rechercher des films et séries
 *     description: Effectue une recherche de films et séries TV via l'API TMDB. Les résultats sont mis en cache pour améliorer les performances.
 *     tags:
 *       - Films
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Terme de recherche (nom du film ou de la série)
 *         example: Inception
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *         description: Numéro de page pour la pagination (défaut 1)
 *         example: 1
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                   description: Terme de recherche normalisé
 *                   example: inception
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Erreur de validation (paramètre q manquant ou invalide)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Erreur serveur ou problème avec l'API TMDB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: TMDB_API_KEY is missing in server config
 */
router.get(
  "/search",
  validate(movieSearchSchema, "query"),
  async (req, res, next) => {
    try {
      const { q, page } = req.validated;

      const normalizedQuery = q.trim().toLowerCase();
      console.log("[TMDB SEARCH] query =", normalizedQuery);

      const cached = cache.get(normalizedQuery);
      if (cached) {
        console.log("[TMDB CACHE] HIT:", normalizedQuery);
        return res.json({ query: normalizedQuery, results: cached });
      }

      console.log("[TMDB CACHE] MISS:", normalizedQuery);

      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: { message: "TMDB_API_KEY is missing in server config" },
        });
      }

      const response = await axios.get(
        "https://api.themoviedb.org/3/search/multi",
        {
          params: {
            api_key: apiKey,
            query: normalizedQuery,
            language: "fr-FR",
            include_adult: false,
            page: page ?? 1,
          },
        }
      );

      const results = (response.data.results || []).map((item) => ({
        tmdbId: item.id,
        title: item.title || item.name || "Titre inconnu",
        overview: item.overview,
        posterPath: item.poster_path,
        mediaType: item.media_type,
        releaseDate: item.release_date || item.first_air_date,
      }));

      cache.set(normalizedQuery, results);

      return res.json({ query: normalizedQuery, results });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /movies/trending:
 *   get:
 *     summary: Récupérer les films tendance du moment
 *     description: Récupère les films les plus populaires du jour via l'API TMDB
 *     tags:
 *       - Films
 *     responses:
 *       200:
 *         description: Liste des films tendance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Erreur serveur ou problème avec l'API TMDB
 */
router.get("/trending", async (req, res, next) => {
  try {
    const cacheKey = "trending_movies_day";
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log("[TMDB TRENDING] CACHE HIT");
      return res.json({ results: cached });
    }

    console.log("[TMDB TRENDING] CACHE MISS");

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: { message: "TMDB_API_KEY is missing in server config" },
      });
    }

    const response = await axios.get(
      "https://api.themoviedb.org/3/trending/movie/day",
      {
        params: {
          api_key: apiKey,
          language: "fr-FR",
        },
      }
    );

    const results = (response.data.results || [])
      .slice(0, 20) // Limiter à 20 films max
      .map((item) => ({
        tmdbId: item.id,
        title: item.title || "Titre inconnu",
        overview: item.overview,
        posterPath: item.poster_path,
        mediaType: "movie",
        releaseDate: item.release_date,
      }));

    // Cache pendant 1 heure (les trending changent lentement)
    cache.set(cacheKey, results, 3600);

    return res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
