import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Settings = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    cabinetName: "",
    address: "",
    collaborators: "",
    phone: "",
    email: "",
    logo: ""
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem("profileCompleted");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem("profileCompleted", JSON.stringify(profileData));
    alert("Modifications enregistrées !");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal avec scroll si nécessaire */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Paramètres</h2>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto w-full">
          <h3 className="text-xl font-semibold mb-4">Informations du Cabinet</h3>
          <input
            type="text"
            name="cabinetName"
            placeholder="Nom du cabinet"
            value={profileData.cabinetName}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="text"
            name="address"
            placeholder="Adresse"
            value={profileData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="number"
            name="collaborators"
            placeholder="Nombre de collaborateurs"
            value={profileData.collaborators}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Téléphone"
            value={profileData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="email"
            name="email"
            placeholder="Email professionnel"
            value={profileData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />

          <div>
            <label className="block text-gray-700 font-semibold">Logo du cabinet</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-2 border rounded" />
            {profileData.logo && (
              <img 
                src={profileData.logo} 
                alt="Logo Cabinet" 
                className="w-24 h-24 rounded-full shadow-lg object-cover mt-2"
              />
            )}
          </div>

          <button onClick={handleSave} className="mt-4 w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Enregistrer les modifications
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={handleLogout} className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded w-40">
            Se Déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
