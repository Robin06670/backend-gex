import React, { useState, useEffect } from "react";

const Topbar = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("profileCompleted");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  return (
    <div className="bg-white shadow flex justify-between items-center p-4">
      <h2 className="text-lg font-semibold">Bienvenue sur GEX</h2> {/* Changement ici */}
      <div className="flex items-center space-x-4">
        {profileData?.logo && (
          <img 
            src={profileData.logo} 
            alt="Cabinet Logo" 
            className="w-12 h-12 rounded-full shadow-lg object-cover"
          />
        )}
        <span className="text-gray-600">Bienvenue, Robin</span>
      </div>
    </div>
  );
};

export default Topbar;
