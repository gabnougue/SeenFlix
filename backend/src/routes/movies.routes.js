import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/debug", (req, res) => {
  res.send("debug ok");
});

// GET /movies/search?q=...
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        error: { message: "Missing search query parameter 'q'" },
      });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: { message: "TMDB_API_KEY is not configured on the server" },
      });
    }

    // Appel à l'API TMDB (ex : recherche multi)
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

    // On simplifie un peu la réponse pour le frontend
    const results = (response.data.results || []).map((item) => ({
      tmdbId: item.id,
      title: item.title || item.name || "Titre inconnu",
      overview: item.overview,
      posterPath: item.poster_path,
      mediaType: item.media_type, // "movie" ou "tv" ou autre
      releaseDate: item.release_date || item.first_air_date,
    }));

    res.json({ query, results });
  } catch (err) {
    // On passe l'erreur au middleware global (étape 5)
    next(err);
  }
});

export default router;
