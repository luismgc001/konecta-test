// src/setupTests.js
import "@testing-library/jest-dom";

// Opcional: Configuración global de pruebas
beforeAll(() => {
  // Configuración global antes de todas las pruebas
});

afterAll(() => {
  // Limpieza global después de todas las pruebas
});

// Silenciar warnings de consola específicos (opcional)
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
