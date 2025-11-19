import { z } from "zod";

export const movieSearchSchema = z.object({
  q: z.string()
       .trim() // enlève les espaces avant validation !
       .min(1, "q (query) est requis"),

  page: z.string().optional(),
});
