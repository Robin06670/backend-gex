const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

// 📌 Import des routes
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const collaboratorRoutes = require("./routes/collaboratorRoutes");
const fixedCostsRoutes = require("./routes/fixedCostsRoutes"); // Importer la nouvelle route

const app = express();
app.use(express.json());
app.use(cors());

// 📌 Connexion à MongoDB
connectDB();

// 📌 Définition des routes API
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/collaborators", collaboratorRoutes);
app.use("/api/fixedcosts", fixedCostsRoutes); // Utiliser la nouvelle route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
