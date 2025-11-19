import { z } from "zod";

/**
 * favoriteCreateSchema
 * - tmdbId : number (id TMDB)
 * - type : "movie" | "tv"
 * - rating? : optional integer 0..5
 * - comment? : optional string (max length to avoid abuse)
 */
export const favoriteCreateSchema = z.object({
  tmdbId: z.number({ invalid_type_error: "tmdbId doit être un nombre" }),
  type: z.enum(["movie", "tv"], { required_error: "type requis", invalid_type_error: "type invalide" }),
  rating: z.number().int().min(0).max(5).optional(),
  comment: z.string().max(500).optional(),
});
