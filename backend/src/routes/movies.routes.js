import express from "express";
import axios from "axios";
import cache from "../utils/cache.js";

const router = express.Router();

// GET /movies/search?q=...
router.get("/search", async (req, res, next) => {
  try {
    let query = req.query.q;

    // Validation de la query
    if (!query || query.trim() === "") {
      return res.status(400).json({
        error: { message: "Missing search query parameter 'q'" },
      });
    }

    // Normalisation pour éviter les faux doublons
    query = query.trim().toLowerCase();

    // Log pour debug (toujours visible)
    console.log("[TMDB SEARCH] query =", query);

    // Vérification du cache
    const cached = cache.get(query);
    if (cached) {
      console.log("[TMDB CACHE] HIT:", query);
      return res.json({ query, results: cached });
    }

    console.log("[TMDB CACHE] MISS:", query);

    // Pour debug, tu peux réactiver ce délai :
    // await new Promise(r => setTimeout(r, 500));

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: { message: "TMDB_API_KEY is not configured on the server" },
      });
    }

    // Appel TMDB
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/multi",
      {
        params: {
          api_key: apiKey,
          query,
          language: "fr-FR",
          include_adult: false,
        },
      }
    );

    const results = (response.data.results || []).map((item) => ({
      tmdbId: item.id,
      title: item.title || item.name || "Titre inconnu",
      overview: item.overview,
      posterPath: item.poster_path,
      mediaType: item.media_type,      // "movie", "tv", etc.
      releaseDate: item.release_date || item.first_air_date,
    }));

    // Mise en cache
    cache.set(query, results);

    // Réponse
    return res.json({ query, results });

  } catch (err) {
    next(err);
  }
});

export default router;
