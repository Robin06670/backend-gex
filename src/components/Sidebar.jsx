import React from "react";
import { FaHome, FaBuilding, FaUsersCog, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; 

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="w-52 h-screen bg-blue-900 bg-opacity-90 backdrop-blur-md text-white flex flex-col p-5 justify-between rounded-2xl shadow-2xl transition-all duration-300">
      
      {/* Logo & Nom */}
      <div>
        <div className="flex items-center mb-6">
          <img 
            src={logo} 
            alt="Logo GEX" 
            className="h-12 mr-3 filter invert brightness-0 contrast-200 transition-transform transform hover:scale-110" 
          />
          <h2 className="text-xl font-bold tracking-wide">GEX</h2>
        </div>

        {/* Menu */}
        <ul className="space-y-3">
          <SidebarItem to="/dashboard" icon={<FaHome />} label="Accueil" />
          <SidebarItem to="/clients" icon={<FaBuilding />} label="Clients" />
          <SidebarItem to="/collaborators" icon={<FaUsersCog />} label="Collaborateurs" />
          <SidebarItem to="/settings" icon={<FaCog />} label="Paramètres" />
        </ul>
      </div>

      {/* Bouton Déconnexion */}
      <button 
        onClick={handleLogout} 
        className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-900 p-3 rounded-xl w-full text-xs font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <FaSignOutAlt className="text-base" />
        <span>Se Déconnecter</span>
      </button>

    </div>
  );
};

// Composant pour chaque item du menu
const SidebarItem = ({ to, icon, label }) => {
  return (
    <li className="flex items-center space-x-3 cursor-pointer hover:bg-blue-700 p-3 rounded-xl transition-all duration-200 transform hover:scale-105">
      <span className="text-base">{icon}</span>
      <Link to={to} className="text-sm font-medium tracking-wide">{label}</Link>
    </li>
  );
};

export default Sidebar;
