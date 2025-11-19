import express from "express";
import { registerSchema, loginSchema } from "../validation/auth.schema.js";
import { registerUser, loginUser } from "../services/auth.service.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors });
  }

  const { email, password } = parse.data;

  try {
    const user = await registerUser(email, password);
    res.status(201).json({ message: "User created", user: { id: user.id, email: user.email }});
  } catch (err) {
    console.error("REGISTER ERROR:", err); 
    if (err.message === "EMAIL_ALREADY_USED") {
      return res.status(409).json({ error: "Email already registered\n" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors });
  }

  const { email, password } = parse.data;

  try {
    const { accessToken, refreshToken, user } = await loginUser(email, password);
    res.json({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
