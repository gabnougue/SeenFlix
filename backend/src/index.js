import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import moviesRouter from "./routes/movies.routes.js";
import authRouter from "./routes/auth.routes.js";
import meRouter from "./routes/me.routes.js";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Configuration Swagger/OpenAPI
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SeenFlix API",
      version: "1.0.0",
      description: "API pour l'application SeenFlix - Gestion de films et authentification utilisateur",
      contact: {
        name: "SeenFlix Team"
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Serveur de développement"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez votre token JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "ID unique de l'utilisateur"
            },
            email: {
              type: "string",
              format: "email",
              description: "Adresse email de l'utilisateur"
            }
          }
        },
        Movie: {
          type: "object",
          properties: {
            tmdbId: {
              type: "integer",
              description: "ID du film dans TMDB"
            },
            title: {
              type: "string",
              description: "Titre du film ou série"
            },
            overview: {
              type: "string",
              description: "Synopsis du contenu"
            },
            posterPath: {
              type: "string",
              nullable: true,
              description: "Chemin du poster sur TMDB"
            },
            mediaType: {
              type: "string",
              enum: ["movie", "tv"],
              description: "Type de média"
            },
            releaseDate: {
              type: "string",
              format: "date",
              nullable: true,
              description: "Date de sortie"
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Message d'erreur"
            }
          }
        },
        ValidationError: {
          type: "object",
          properties: {
            error: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string"
                  },
                  message: {
                    type: "string"
                  },
                  path: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  }
                }
              },
              description: "Liste des erreurs de validation"
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js", "./src/index.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Route Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "SeenFlix API Documentation"
}));

// Routes
app.use("/movies", moviesRouter);

app.use("/auth", authRouter);

app.use("/me", meRouter)

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Vérifie l'état de santé de l'API
 *     description: Endpoint pour vérifier que l'API est opérationnelle
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: L'API fonctionne correctement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SeenFlix API running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});


