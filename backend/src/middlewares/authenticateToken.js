import jwt from "jsonwebtoken";

/**
 * Middleware Express pour protéger les routes avec JWT.
 * Lit le header Authorization: Bearer <token>
 * Vérifie le token avec JWT_ACCESS_SECRET
 * Attache req.user = { id, email } si valide
 * Renvoie 401 JSON si token manquant ou invalide
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: missing Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // Format attendu : "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
  }
}
