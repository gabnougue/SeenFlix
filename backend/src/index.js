import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import moviesRouter from "./routes/movies.routes.js";
import authRouter from "./routes/auth.routes.js";
import meRouter from "./routes/me.routes.js";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/movies", moviesRouter);

app.use("/auth", authRouter);

app.use("/me", meRouter)

// Route de test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SeenFlix API running on http://localhost:${PORT}`);
});


