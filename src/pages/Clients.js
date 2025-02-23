import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaEuroSign, FaPlus, FaTrash, FaSearch, FaSort, FaEye } from "react-icons/fa";
import CountUp from "react-countup";

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([
    { id: 1, name: "Société Alpha", industry: "Finance", fees: 3500 },
    { id: 2, name: "Entreprise Bêta", industry: "Consulting", fees: 4200 },
    { id: 3, name: "Cabinet Gamma", industry: "Assurance", fees: 2800 },
    { id: 4, name: "Startup Delta", industry: "Tech", fees: 5000 },
    { id: 5, name: "Groupe Epsilon", industry: "Immobilier", fees: 6200 }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filtrer les clients en fonction du terme recherché
  const filteredClients = clients
    .filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortBy === "industry") return sortOrder === "asc" ? a.industry.localeCompare(b.industry) : b.industry.localeCompare(a.industry);
      if (sortBy === "fees") return sortOrder === "asc" ? a.fees - b.fees : b.fees - a.fees;
      return 0;
    });

  // Changer l'ordre de tri
  const toggleSortOrder = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(criteria);
      setSortOrder("asc");
    }
  };

  // Supprimer un client avec confirmation
  const handleDeleteClient = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6">
        
        {/* En-tête avec bouton Ajouter et Titre */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Liste des Clients</h1>
          <button 
            onClick={() => navigate("/clients/new")} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 flex items-center transition-transform transform hover:scale-105"
          >
            <FaPlus className="mr-2" /> Ajouter Client
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full max-w-lg mx-auto mb-6">
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            className="w-full p-2 border rounded pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
        </div>

        {/* Tableau des Clients */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left cursor-pointer" onClick={() => toggleSortOrder("name")}>
                  Nom <FaSort className="inline ml-1" />
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => toggleSortOrder("industry")}>
                  Secteur <FaSort className="inline ml-1" />
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => toggleSortOrder("fees")}>
                  Honoraires <FaSort className="inline ml-1" />
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.industry}</td>
                  <td className="p-3">
                    <FaEuroSign className="inline text-gray-500 mr-1" />
                    <CountUp end={client.fees} duration={1.5} separator=" " /> €
                  </td>
                  <td className="p-3 flex justify-center space-x-4">
                    <button 
                      onClick={() => navigate(`/clients/${client.id}`)} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Clients;
