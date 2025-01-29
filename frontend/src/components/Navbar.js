import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white font-bold">Sistema Empleados</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/dashboard"
                  className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
                >
                  Dashboard
                </Link>
                <Link
                  to="/employees"
                  className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
                >
                  Empleados
                </Link>
                {auth?.user?.role === "admin" && (
                  <Link
                    to="/requests"
                    className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
                  >
                    Solicitudes
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-white mr-4">{auth?.user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
