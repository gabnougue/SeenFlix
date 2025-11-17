import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Route de test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SeenFlix API running on http://localhost:${PORT}`);
});
