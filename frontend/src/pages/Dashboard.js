import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.rol === "administrador";
  const [stats, setStats] = useState({
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    totalEmpleados: 0,
  });
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Para administradores: obtener estadísticas generales
        if (isAdmin) {
          const [statsResponse, solicitudesResponse] = await Promise.all([
            api("/solicitudes/stats"),
            api("/solicitudes/recientes"),
          ]);
          setStats(statsResponse);
          setSolicitudesRecientes(solicitudesResponse.data);
        } else {
          // Para empleados: obtener solo sus solicitudes
          const response = await api("/solicitudes/mis-solicitudes");
          setSolicitudesRecientes(response.data);
        }
      } catch (err) {
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && (
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tarjetas de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/solicitudes/nueva"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Nueva Solicitud</h2>
          <p className="text-gray-600">Crear una nueva solicitud</p>
        </Link>

        <Link
          to="/solicitudes"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Mis Solicitudes</h2>
          <p className="text-gray-600">Ver todas mis solicitudes</p>
        </Link>

        {isAdmin && (
          <Link
            to="/empleados"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold mb-2">Gestión de Empleados</h2>
            <p className="text-gray-600">Administrar empleados</p>
          </Link>
        )}
      </div>

      {/* Estadísticas (solo para administradores) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Total Solicitudes</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalSolicitudes}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">
              Solicitudes Pendientes
            </h3>
            <p className="text-3xl font-bold mt-2 text-yellow-600">
              {stats.solicitudesPendientes}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700">Total Empleados</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalEmpleados}</p>
          </div>
        </div>
      )}

      {/* Solicitudes Recientes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {isAdmin ? "Solicitudes Recientes" : "Mis Solicitudes Recientes"}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Tipo</th>
                <th className="text-left py-3">Descripción</th>
                <th className="text-left py-3">Estado</th>
                <th className="text-left py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesRecientes.map((solicitud) => (
                <tr key={solicitud.id} className="border-b">
                  <td className="py-3">{solicitud.tipo_solicitud}</td>
                  <td className="py-3">{solicitud.descripcion}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        solicitud.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : solicitud.estado === "aprobada"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {solicitud.estado}
                    </span>
                  </td>
                  <td className="py-3">
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="p-3 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
            onClick={() => {
              /* manejar acción */
            }}
          >
            Nueva Solicitud
          </button>
          {isAdmin && (
            <>
              <button
                className="p-3 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                onClick={() => {
                  /* manejar acción */
                }}
              >
                Aprobar Solicitudes
              </button>
              <button
                className="p-3 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                onClick={() => {
                  /* manejar acción */
                }}
              >
                Ver Pendientes
              </button>
              <button
                className="p-3 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                onClick={() => {
                  /* manejar acción */
                }}
              >
                Registrar Empleado
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
