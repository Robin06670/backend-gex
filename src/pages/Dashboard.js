import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaUsers, FaUserTie, FaThLarge, FaBuilding, FaEuroSign } from "react-icons/fa";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    clients: 0,
    collaborators: 0
  });

  const [profileData, setProfileData] = useState(null);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    // Charger les informations du cabinet depuis localStorage
    const storedProfile = localStorage.getItem("profileCompleted");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }

    // Simuler des données statistiques
    setTimeout(() => {
      setStats({
        clients: 125,
        collaborators: 12
      });

      // Simuler des clients récents
      setRecentClients([
        { id: 1, name: "Société Alpha", industry: "Finance", fees: 3500 },
        { id: 2, name: "Entreprise Bêta", industry: "Consulting", fees: 4200 },
        { id: 3, name: "Cabinet Gamma", industry: "Assurance", fees: 2800 },
        { id: 4, name: "Startup Delta", industry: "Tech", fees: 5000 },
        { id: 5, name: "Groupe Epsilon", industry: "Immobilier", fees: 6200 }
      ]);
    }, 500);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal avec ajustement dynamique */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Topbar />
        
        <main className="p-6 flex flex-col items-center">
          {/* Titre stylisé avec une icône moderne */}
          <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <FaThLarge className="text-blue-700 mr-2" /> Tableau de bord
          </h1>

          {/* Informations du Cabinet - Centré */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-center mb-6">
            {profileData?.logo && (
              <img 
                src={profileData.logo} 
                alt="Logo Cabinet" 
                className="w-20 h-20 mx-auto rounded-full shadow-lg object-cover mb-4"
              />
            )}
            <h2 className="text-xl font-semibold">{profileData?.cabinetName || "Nom du cabinet"}</h2>
            <p className="text-gray-600">{profileData?.address || "Adresse du cabinet"}</p>
          </div>

          {/* Cartes Statistiques avec animation de comptage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tuile Clients cliquable */}
            <div className="cursor-pointer" onClick={() => navigate("/clients")}>
              <StatCard icon={<FaUsers />} title="Clients" value={stats.clients} color="bg-gradient-to-r from-blue-700 to-blue-900" />
            </div>
            
            {/* Tuile Collaborateurs */}
            <StatCard icon={<FaUserTie />} title="Collaborateurs" value={stats.collaborators} color="bg-gradient-to-r from-teal-500 to-green-700" />
          </div>

          {/* Derniers Clients Ajoutés avec hauteur ajustée */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-6 max-h-[30vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaBuilding className="text-gray-600 mr-2" /> Derniers Clients Ajoutés
            </h2>
            <ul className="text-gray-700">
              {recentClients.map((client) => (
                <li key={client.id} className="py-2 border-b flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold">{client.name}</span>
                    <span className="text-sm text-gray-500">{client.industry}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaEuroSign className="mr-1 text-sm" />
                    <span className="text-sm font-medium">
                      <CountUp end={client.fees} duration={1.5} separator=" " /> €
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

// Composant réutilisable pour une carte statistique avec animation de comptage
const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className={`p-6 ${color} text-white rounded-lg shadow-lg flex items-center`}>
      <div className="text-4xl mr-4">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl">
          <CountUp end={value} duration={2} separator=" " />
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
