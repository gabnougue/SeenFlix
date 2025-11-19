import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// Exemple route protégée
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

export default router;
