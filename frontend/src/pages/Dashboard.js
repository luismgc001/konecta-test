import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import RequestModal from "../components/RequestModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, solicitudesResponse] = await Promise.all([
        api("/solicitudes/stats"),
        api("/solicitudes/recientes"),
      ]);

      setStats(statsResponse);
      setSolicitudesRecientes(solicitudesResponse || []);
    } catch (err) {
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
          <h2 className="text-lg font-semibold mb-2">Nueva Solicitud</h2>
          <p className="text-gray-600">Crear una nueva solicitud</p>
        </button>

        <Link
          to="/Requests"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Mis Solicitudes</h2>
          <p className="text-gray-600">Ver todas mis solicitudes</p>
        </Link>

        {isAdmin && (
          <Link
            to="/Employees"
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
          {solicitudesRecientes.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay solicitudes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                "No has creado ninguna solicitud aún"
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Nueva Solicitud
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Solicitante</th>
                  <th className="text-left py-3">Tipo</th>
                  <th className="text-left py-3">Descripción</th>
                  <th className="text-left py-3">Estado</th>
                  <th className="text-left py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesRecientes.map((solicitud) => (
                  <tr key={solicitud.id} className="border-b">
                    <td className="py-3">
                      {`${solicitud.nombre} ${solicitud.apellido}`}
                    </td>
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
          )}
        </div>
      </div>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
