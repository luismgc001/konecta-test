import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.role === "admin";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjetas de información */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Bienvenido</h2>
          <p className="text-gray-600">
            {isAdmin ? "Panel de administración" : "Panel de empleado"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Tu Rol</h2>
          <p className="text-gray-600">
            {isAdmin ? "Administrador" : "Empleado"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Accesos</h2>
          <p className="text-gray-600">
            {isAdmin
              ? "Acceso total al sistema"
              : "Acceso limitado a consultas"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
