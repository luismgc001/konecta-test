const request = require("supertest");
const { app } = require("../index");
const { pool } = require("../src/config/database");

describe("Auth Endpoints", () => {
  // Datos de prueba
  const testUser = {
    username: "testuser",
    password: "password123",
    rol: "empleado",
  };

  beforeAll(async () => {
    // Limpiar datos de prueba anteriores
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
      // Limpiar datos de prueba
      await pool.query("DELETE FROM usuarios WHERE username = $1", [
        testUser.username,
      ]);
      // Cerrar la conexión
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
