import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import RequestModal from "../components/RequestModal";

const Requests = () => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.rol === "administrador";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api(`/solicitudes?page=${page}`);
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, viewMode]);

  const filteredRequests = useMemo(() => {
    if (!isAdmin || viewMode === "own") {
      return requests.filter((request) => request.usuario_id === auth.user.id);
    }
    return requests;
  }, [requests, viewMode, isAdmin, auth?.user?.id]);

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("¿Está seguro que desea eliminar esta solicitud?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api(`/solicitudes/${id}`, {
        method: "DELETE",
      });
      fetchRequests();
    } catch (err) {
      setError("Error al eliminar solicitud");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUpdateStatus = async (id, estado) => {
    if (!isAdmin) return;

    try {
      await api(`/solicitudes/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
      });
      fetchRequests();
    } catch (err) {
      setError("Error al actualizar el estado de la solicitud");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Solicitudes</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {isAdmin && (
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Ver todas las solicitudes</option>
                <option value="own">Ver solo mis solicitudes</option>
              </select>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 whitespace-nowrap"
            >
              Nueva Solicitud
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isAdmin && (
          <div className="text-sm text-gray-500">
            Mostrando:{" "}
            {viewMode === "all"
              ? "Todas las solicitudes"
              : "Solo mis solicitudes"}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid gap-4 p-6">
          {filteredRequests.length === 0 ? (
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
                {viewMode === "own"
                  ? "No has creado ninguna solicitud aún"
                  : "No hay solicitudes registradas en el sistema"}
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
            filteredRequests.map((request) => (
              <div key={request.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {request.nombre} {request.apellido}
                      </h3>
                      <span
                        className={`px-2 py-1 text-sm rounded ${
                          request.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.estado === "aprobada"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.estado}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{request.descripcion}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block px-2 py-1 text-sm rounded bg-gray-100">
                        {request.tipo_solicitud}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.fecha_solicitud).toLocaleDateString()}
                      </span>
                    </div>

                    {isAdmin && request.estado === "pendiente" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(request.id, "aprobada")
                          }
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Aprobar
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(request.id, "rechazada")
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(request.id)}
                      disabled={deleteLoading === request.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deleteLoading === request.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Eliminar"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controles de paginación */}
      {filteredRequests.length > 0 && viewMode === "all" && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= pagination.totalPages}
            >
              Siguiente
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages} (
            {pagination.total} solicitudes)
          </div>
        </div>
      )}

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchRequests();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Requests;
