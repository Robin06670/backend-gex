require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Importer les routes
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Connexion à la base de données
connectDB();

// Définir les routes API
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
