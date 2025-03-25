const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    // ✅ On transmet l'id, le rôle ET le cabinet via req.user
    req.user = {
      id: verified.id,
      role: verified.role,
      cabinet: verified.cabinet, // ← ajouté ici
    };

    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide." });
  }
};

module.exports = verifyToken;
