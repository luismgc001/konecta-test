import React, { useState } from "react";
import { api } from "../utils/api";

const RequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    tipo_solicitud: "general",
    descripcion: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api("/solicitudes", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nueva Solicitud</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="tipo_solicitud"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo de Solicitud
            </label>
            <select
              id="tipo_solicitud"
              name="tipo_solicitud"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.tipo_solicitud}
              onChange={handleChange}
            >
              <option value="general">General</option>
              <option value="urgente">Urgente</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="permiso">Permiso</option>
              <option value="vacaciones">Vacaciones</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe tu solicitud..."
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
