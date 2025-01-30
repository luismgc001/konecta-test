import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import RegisterModal from "../components/RegisterModal";

const Employees = () => {
  const { auth } = useAuth();
  const isAdmin = auth?.user?.rol === "administrador";
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await api(`/empleados?page=${page}`);
      console.log("EMPLEADOS RESP:", response);
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
      await api("/empleados", {
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
      {isAdmin && (
        <>
          <button
            className="p-3 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            Registrar Empleado
          </button>
        </>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
              {isAdmin && (
                <>
                  <button
                    className="p-3 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    onClick={() => setIsRegisterModalOpen(true)}
                  >
                    Registrar Empleado
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-left">Nombre</th>
              <th className="px-6 py-3 border-b text-left">Email</th>
              <th className="px-6 py-3 border-b text-left">Telefono</th>
              <th className="px-6 py-3 border-b text-left">Salario</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 border-b">
                  {`${employee.nombre} ${employee.apellido}`}
                </td>
                <td className="px-6 py-4 border-b">{employee.email}</td>
                <td className="px-6 py-4 border-b">{employee.telefono}</td>
                <td className="px-6 py-4 border-b text-right">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                  }).format(employee.salario)}
                </td>
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
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          fetchEmployees(); // Actualiza la lista de empleados
          setIsRegisterModalOpen(false); // Cierra el modal
        }}
      />
    </div>
  );
};

export default Employees;
