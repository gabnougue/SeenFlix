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
    const rawData = req[source];

    const result = schema.safeParse(rawData);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        error: "validation_error",
        details: errors,
      });
    }

    // Body et params peuvent être remplacés
    if (source === "body" || source === "params") {
      req[source] = result.data;
    }

    // Query → valide dans req.validated
    req.validated = result.data;

    next();
  };
}

  