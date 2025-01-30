import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const Requests = () => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.role === "administrador";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    type: "general",
  });

  const fetchRequests = async () => {
    try {
      const response = await api(`/requests?page=${page}`);
      setRequests(response.data);
    } catch (err) {
      setError("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api("/requests", {
        method: "POST",
        body: JSON.stringify(newRequest),
      });
      setNewRequest({ title: "", description: "", type: "general" });
      fetchRequests();
    } catch (err) {
      setError("Error al crear solicitud");
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    try {
      await api(`/requests/${id}`, {
        method: "DELETE",
      });
      fetchRequests();
    } catch (err) {
      setError("Error al eliminar solicitud");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Solicitudes</h1>

      {error && (
        <div className="bg-red-50 p-4 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Nueva Solicitud</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            value={newRequest.title}
            onChange={(e) =>
              setNewRequest({ ...newRequest, title: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Descripción"
            value={newRequest.description}
            onChange={(e) =>
              setNewRequest({ ...newRequest, description: e.target.value })
            }
            className="w-full border rounded px-3 py-2 h-32"
            required
          />
          <select
            value={newRequest.type}
            onChange={(e) =>
              setNewRequest({ ...newRequest, type: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="general">General</option>
            <option value="urgent">Urgente</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Crear Solicitud
        </button>
      </form>

      <div className="bg-white rounded-lg shadow">
        <div className="grid gap-4 p-6">
          {requests.map((request) => (
            <div key={request.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{request.title}</h3>
                  <p className="text-gray-600 mt-1">{request.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-sm rounded bg-gray-100">
                    {request.type}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 border rounded hover:bg-gray-100"
          disabled={page === 1}
        >
          Anterior
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded hover:bg-gray-100"
          disabled={requests.length === 0}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Requests;
