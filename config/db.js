const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Connecté à MongoDB Atlas : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    console.log("✅ Connexion MongoDB établie.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ Erreur MongoDB :", err);
  });
};

module.exports = connectDB;
