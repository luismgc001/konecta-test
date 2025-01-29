// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.rol === "administrador";

  if (!auth) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    // Si está autenticado pero no es admin, redirigir al dashboard
    return <Navigate to="/dashboard" />;
  }

  // Si es admin, mostrar el componente
  return children;
};

export default ProtectedAdminRoute;
