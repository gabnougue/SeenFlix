import { z } from "zod";

/**
 * favoriteCreateSchema
 * - tmdbId : integer > 0
 * - type : "movie" | "tv"
 * - rating? : optional integer 0..5
 * - comment? : optional string
 */
export const favoriteCreateSchema = z.object({
  tmdbId: z
    .number({
      invalid_type_error: "tmdbId doit être un nombre",
      required_error: "tmdbId requis"
    })
    .int("tmdbId doit être un entier")
    .positive("tmdbId doit être positif"),

  type: z.enum(["movie", "tv"], {
    required_error: "type requis",
    invalid_type_error: "type invalide"
  }),

  rating: z
    .number({
      invalid_type_error: "rating doit être un nombre"
    })
    .int("rating doit être un entier")
    .min(0, "rating min = 0")
    .max(5, "rating max = 5")
    .optional(),

  comment: z
    .string({
      invalid_type_error: "comment doit être une chaîne"
    })
    .max(500, "500 caractères max")
    .optional(),
});
