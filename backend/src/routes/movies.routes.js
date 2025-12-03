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
        voteAverage: item.vote_average || 0,
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
        voteAverage: item.vote_average || 0,
      }));

    // Cache pendant 1 heure (les trending changent lentement)
    cache.set(cacheKey, results, 3600);

    return res.json({ results });
  } catch (err) {
    next(err);
  }
});

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * @openapi
 * /movies/{type}/{id}:
 *   get:
 *     summary: Récupérer les détails d'un film et les avis SeenFlix
 *     tags:
 *       - Films
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [movie, tv]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails complets et avis
 */
router.get("/:type/:id", async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const tmdbId = parseInt(id, 10);

    if (isNaN(tmdbId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const apiKey = process.env.TMDB_API_KEY;

    // 1. Récupérer les détails TMDB
    const tmdbPromise = axios.get(
      `https://api.themoviedb.org/3/${type}/${tmdbId}`,
      {
        params: {
          api_key: apiKey,
          language: "fr-FR",
          append_to_response: "credits,videos" // Pour avoir le casting et trailers si besoin
        },
      }
    );

    // 2. Récupérer les avis de la BDD locale (SeenFlix)
    const reviewsPromise = prisma.favorite.findMany({
      where: {
        tmdbId: tmdbId,
        type: type,
        // On ne prend que ceux qui ont une note ou un commentaire
        OR: [
          { rating: { gt: 0 } },
          { comment: { not: null } }
        ]
      },
      include: {
        user: {
          select: { email: true } // On récupère l'email pour l'afficher (ou un pseudo si vous en aviez un)
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const [tmdbResponse, reviewsDb] = await Promise.all([tmdbPromise, reviewsPromise]);
    const movieData = tmdbResponse.data;

    // 3. Calculer la moyenne SeenFlix
    let seenFlixRating = 0;
    const ratedReviews = reviewsDb.filter(r => r.rating > 0);
    if (ratedReviews.length > 0) {
      const sum = ratedReviews.reduce((acc, curr) => acc + curr.rating, 0);
      seenFlixRating = sum / ratedReviews.length;
    }

    // 4. Formater les avis pour le frontend
    const reviews = reviewsDb.map(r => ({
      id: r.id,
      user: r.user.email.split('@')[0], // On cache la partie domaine de l'email pour faire "pseudo"
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt
    }));

    // 5. Construire la réponse finale
    const result = {
      tmdbId: movieData.id,
      title: movieData.title || movieData.name,
      originalTitle: movieData.original_title || movieData.original_name,
      overview: movieData.overview,
      posterPath: movieData.poster_path,
      backdropPath: movieData.backdrop_path,
      releaseDate: movieData.release_date || movieData.first_air_date,
      genres: movieData.genres,
      runtime: movieData.runtime || (movieData.episode_run_time ? movieData.episode_run_time[0] : null),
      voteAverageTmdb: movieData.vote_average, // Note TMDB
      seenFlixRating: parseFloat(seenFlixRating.toFixed(1)), // Note SeenFlix
      reviews: reviews
    };

    res.json(result);

  } catch (err) {
    // Si 404 TMDB
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: "Film introuvable sur TMDB" });
    }
    next(err);
  }
});
export default router;
