import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (!nom || !prenom || !email || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some((user) => user.email === email)) {
      setError("Cet email est déjà utilisé.");
      return;
    }

    try {
      // 🔥 Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = { nom, prenom, email, password: hashedPassword };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      setSuccess("Inscription réussie ! Vous allez être redirigé.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError("Une erreur est survenue lors de l'inscription.");
      console.error("Erreur de hachage du mot de passe :", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center">

        {/* Logo Cliquable */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo GEX" className="h-16 cursor-pointer" onClick={() => navigate("/")} />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Inscription</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="flex gap-4">
          <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)}
            className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
          <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)}
            className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
        </div>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
        <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />

        <button onClick={handleRegister}
          className="w-full px-6 py-3 mt-6 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1B3A94] transition">
          S'inscrire
        </button>

        <div className="mt-4 text-sm text-gray-600">
          Déjà un compte ? <span className="text-[#1E40AF] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}>Connectez-vous</span>
        </div>
      </div>
    </div>
  );
}
