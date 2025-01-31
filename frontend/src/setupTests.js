// src/setupTests.js
import "@testing-library/jest-dom";

beforeAll(() => {});

afterAll(() => {});

const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
