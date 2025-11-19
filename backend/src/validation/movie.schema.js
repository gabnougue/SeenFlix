import { z } from "zod";

export const movieSearchSchema = z.object({
  q: z.string().min(1, { message: "q (query) est requis" }),
  page: z.string().optional(), // si tu veux le transformer ensuite avec preprocess
});
