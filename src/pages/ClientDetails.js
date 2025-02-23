import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ClientDetails = ({ isNew }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(
    isNew
      ? { name: "", industry: "", fees: "", contact: "", phone: "", email: "", address: "" }
      : null
  );

  useEffect(() => {
    if (!isNew) {
      const clientsData = JSON.parse(localStorage.getItem("clients")) || [];
      const client = clientsData.find(client => client.id === parseInt(id));
      if (!client) {
        navigate("/clients");
      } else {
        setClientData(client);
      }
    }
  }, [id, isNew, navigate]);

  const handleEditClient = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = () => {
    let clientsData = JSON.parse(localStorage.getItem("clients")) || [];

    if (isNew) {
      const newClient = { ...clientData, id: clientsData.length + 1 };
      clientsData.push(newClient);
    } else {
      clientsData = clientsData.map(client => client.id === parseInt(id) ? clientData : client);
    }

    localStorage.setItem("clients", JSON.stringify(clientsData));
    alert("Client enregistré !");
    navigate("/clients");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800">{isNew ? "Créer un Client" : "Fiche Client"}</h1>

        {clientData ? (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-semibold mb-4">{clientData.name || "Nouveau Client"}</h2>

            <div className="flex flex-col space-y-4">
              <div>
                <label className="font-semibold">Nom</label>
                <input 
                  type="text" 
                  name="name"
                  value={clientData.name} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Secteur</label>
                <input 
                  type="text" 
                  name="industry"
                  value={clientData.industry} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Contact</label>
                <input 
                  type="text" 
                  name="contact"
                  value={clientData.contact} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Téléphone</label>
                <input 
                  type="text" 
                  name="phone"
                  value={clientData.phone} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={clientData.email} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Adresse</label>
                <input 
                  type="text" 
                  name="address"
                  value={clientData.address} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Honoraires (€)</label>
                <input 
                  type="number" 
                  name="fees"
                  value={clientData.fees} 
                  onChange={handleEditClient} 
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button 
                onClick={handleSaveChanges} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Enregistrer
              </button>
              <button 
                onClick={() => navigate("/clients")} 
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Chargement...</p>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
