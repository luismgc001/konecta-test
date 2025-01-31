// src/pages/Employees.test.js
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import Employees from "./Employees";
import { api } from "../utils/api";

jest.mock("../utils/api");

const mockEmployeesData = {
  data: [
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@example.com",
      telefono: "1234567890",
      salario: 2000000,
    },
  ],
  pagination: {
    total: 1,
    totalPages: 1,
    page: 1,
    limit: 10,
  },
};

const renderEmployees = (userRole = "administrador") => {
  const authValue = {
    auth: {
      user: {
        rol: userRole,
      },
    },
  };

  return render(
    <AuthProvider value={authValue}>
      <Employees />
    </AuthProvider>
  );
};

describe("Employees Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.mockResolvedValue(mockEmployeesData);
  });

  test("renders employees table with data", async () => {
    renderEmployees();

    const employeeName = await screen.findByText("Juan Pérez");
    expect(employeeName).toBeInTheDocument();

    const employeeEmail = await screen.findByText("juan@example.com");
    expect(employeeEmail).toBeInTheDocument();

    const employeePhone = await screen.findByText("1234567890");
    expect(employeePhone).toBeInTheDocument();
  });

  test("shows error message when API fails", async () => {
    api.mockRejectedValue(new Error("Error al cargar empleados"));
    renderEmployees();

    const errorMessage = await screen.findByText(/error al cargar empleados/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
