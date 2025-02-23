import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email);

    if (!user) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Vérification du mot de passe avec bcrypt (asynchrone)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Stocker l'utilisateur connecté et le token
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("token", "user_authenticated"); // Ajout du token

    navigate("/dashboard"); // Redirection vers le Dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center">

        {/* Logo Cliquable */}
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="Logo GEX"
            className="h-16 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Connexion</h2>

        {/* Message d'erreur */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Champs Email et Mot de passe */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
        />

        {/* Bouton de connexion */}
        <button
          onClick={handleLogin}
          className="w-full px-6 py-3 bg-[#1E40AF] text-white font-semibold rounded-lg shadow-md hover:bg-[#1B3A94] transition duration-300 cursor-pointer"
        >
          Se connecter
        </button>

        {/* Redirection vers l'inscription */}
        <div className="mt-4 text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <span 
            className="text-[#1E40AF] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Inscrivez-vous
          </span>
        </div>
      </div>
    </div>
  );
}
