import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequestModal from "./RequestModal";
import { api } from "../utils/api";

jest.mock("../utils/api");

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

describe("RequestModal Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form elements when modal is open", async () => {
    render(<RequestModal {...mockProps} />);

    const tipoSelect = await screen.findByRole("combobox", {
      name: /tipo de solicitud/i,
    });
    expect(tipoSelect).toBeInTheDocument();

    const descripcionInput = await screen.findByRole("textbox", {
      name: /descripción/i,
    });
    expect(descripcionInput).toBeInTheDocument();

    const submitButton = await screen.findByRole("button", {
      name: /crear solicitud/i,
    });
    expect(submitButton).toBeInTheDocument();
  });

  test("doesnt render when isOpen is false", () => {
    render(<RequestModal {...mockProps} isOpen={false} />);
    expect(screen.queryByText(/nueva solicitud/i)).not.toBeInTheDocument();
  });

  test("submits form data correctly", async () => {
    api.mockResolvedValue({});
    render(<RequestModal {...mockProps} />);

    const tipoSelect = screen.getByRole("combobox", {
      name: /tipo de solicitud/i,
    });
    const descripcionInput = screen.getByRole("textbox", {
      name: /descripción/i,
    });

    fireEvent.change(tipoSelect, { target: { value: "vacaciones" } });
    fireEvent.change(descripcionInput, {
      target: { value: "Solicito vacaciones" },
    });

    const submitButton = screen.getByRole("button", {
      name: /crear solicitud/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith("/solicitudes", {
        method: "POST",
        body: JSON.stringify({
          tipo_solicitud: "vacaciones",
          descripcion: "Solicito vacaciones",
        }),
      });
    });

    await waitFor(() => expect(mockProps.onSuccess).toHaveBeenCalled());
    await waitFor(() => expect(mockProps.onClose).toHaveBeenCalled());
  });

  test("shows error message on failed submission", async () => {
    api.mockRejectedValue(new Error("Error al crear solicitud"));
    render(<RequestModal {...mockProps} />);

    const submitButton = screen.getByRole("button", {
      name: /crear solicitud/i,
    });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/error al crear solicitud/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
