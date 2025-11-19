/**
 * validate(schema, source)
 * - schema : Zod schema
 * - source : "body" | "params" | "query" (default "body")
 *
 * Usage:
 * router.post('/register', validate(registerSchema), handler)
 */
export function validate(schema, source = "body") {
    return (req, res, next) => {
      const target = req[source];
      const result = schema.safeParse(target);
  
      if (!result.success) {
        // format erreurs dans un objet simple
        const errors = result.error.errors.map(e => ({
          path: e.path.join("."),
          message: e.message
        }));
        return res.status(400).json({ error: "validation_error", details: errors });
      }
  
      // remplacer la donnée par la version parsée/coercée (utile si preprocess)
      req[source] = result.data;
      return next();
    };
  }
  