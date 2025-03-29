const jwt = require("jsonwebtoken");
const Collaborator = require("../models/Collaborator");

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    req.user = {
      id: verified.id,
      role: verified.role,
      cabinet: verified.cabinet,
    };

    // 🔍 Récupération du Collaborator lié à l'utilisateur
    const collab = await Collaborator.findOne({ user: verified.id });
    if (collab) {
      req.user.collaborator = collab._id;
    }

    next();
  } catch (err) {
    console.error("Erreur authMiddleware :", err);
    res.status(400).json({ message: "Token invalide ou erreur serveur." });
  }
};

module.exports = verifyToken;
