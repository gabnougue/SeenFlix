import express from "express";
import axios from "axios";
import cache from "../utils/cache.js";

import { validate } from "../validation/validate.middleware.js";
import { movieSearchSchema } from "../validation/movie.schema.js";

const router = express.Router();

// GET /movies/search?q=...
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


export default router;
