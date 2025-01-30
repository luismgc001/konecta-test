const request = require("supertest");
const { app } = require("../index");
const { pool } = require("../src/config/database");

describe("Auth Endpoints", () => {
  const testUser = {
    username: "test",
    password: "test",
    rol: "administrador",
    nombre: "Test",
    apellido: "User",
    email: "test@example.com",
    telefono: "+1234567890",
    fecha_contratacion: "2024-01-30",
    salario: 50000,
  };

  beforeAll(async () => {
    try {
      await pool.query("DELETE FROM usuarios WHERE username = $1", [
        testUser.username,
      ]);
    } catch (error) {
      console.error("Error en la limpieza inicial:", error);
    }
  });

  afterAll(async () => {
    try {
      await pool.query("DELETE FROM usuarios WHERE username = $1", [
        testUser.username,
      ]);
      await pool.end();
    } catch (error) {
      console.error("Error en la limpieza final:", error);
    }
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.username).toBe(testUser.username);
      // Verificar campos adicionales
      expect(response.body.user).toHaveProperty("rol", "empleado");
    });

    it("should not register a user with missing required fields", async () => {
      const incompleteUser = {
        username: "incomplete",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should not register a duplicate user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: testUser.username,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("rol");
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: testUser.username,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });
  });
});
