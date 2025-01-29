import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const Employees = () => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
  });

  const fetchEmployees = async () => {
    try {
      const response = await api(`/employees?page=${page}`);
      setEmployees(response.data);
    } catch (err) {
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      await api("/employees", {
        method: "POST",
        body: JSON.stringify(newEmployee),
      });
      setNewEmployee({ name: "", email: "", position: "" });
      fetchEmployees();
    } catch (err) {
      setError("Error al crear empleado");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Empleados</h1>

      {error && (
        <div className="bg-red-50 p-4 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Nuevo Empleado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, email: e.target.value })
              }
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Cargo"
              value={newEmployee.position}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, position: e.target.value })
              }
              className="border rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Agregar Empleado
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-left">Nombre</th>
              <th className="px-6 py-3 border-b text-left">Email</th>
              <th className="px-6 py-3 border-b text-left">Cargo</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 border-b">{employee.name}</td>
                <td className="px-6 py-4 border-b">{employee.email}</td>
                <td className="px-6 py-4 border-b">{employee.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
          disabled={employees.length === 0}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Employees;
