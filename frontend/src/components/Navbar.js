import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = auth?.user?.rol === "administrador";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función para determinar si un link está activo
  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isLinkActive(to)
          ? "bg-indigo-700 text-white"
          : "text-white hover:bg-indigo-500"
      }`}
    >
      {children}
    </Link>
  );

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
                <NavLink to="/dashboard">Dashboard</NavLink>
                {isAdmin && <NavLink to="/Employees">Empleados</NavLink>}
                <NavLink to="/Requests">Solicitudes</NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-white text-sm">
                    {auth?.user?.username}
                  </span>
                  <span className="text-indigo-200 text-xs">
                    {auth?.user?.rol.charAt(0).toUpperCase() +
                      auth?.user?.rol.slice(1)}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {auth?.user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9.707 5.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L11.414 12H15a1 1 0 100-2h-3.586l1.293-1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
