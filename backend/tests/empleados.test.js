const request = require("supertest");
const { app } = require("../index");

describe("Empleados Endpoints", () => {
  let authToken;
  let adminAuthToken;

  beforeAll(async () => {
    // Login como empleado normal
    const loginRes = await request(app).post("/api/auth/login").send({
      username: "empleado.prueba",
      password: "empleado.prueba",
    });
    authToken = loginRes.body.token;

    // Login como administrador
    const adminLoginRes = await request(app).post("/api/auth/login").send({
      username: "administrador",
      password: "administrador",
    });
    adminAuthToken = adminLoginRes.body.token;
  });

  describe("GET /api/empleados", () => {
    it("should get paginated employees", async () => {
      const res = await request(app)
        .get("/api/empleados?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("page");
      expect(res.body.pagination).toHaveProperty("limit");
      expect(res.body.pagination).toHaveProperty("totalPages");
    });

    it("should filter employees by search term", async () => {
      const res = await request(app)
        .get("/api/empleados?search=test")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should order employees by specified field", async () => {
      const res = await request(app)
        .get("/api/empleados?orderBy=nombre&order=ASC")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/empleados", () => {
    const newEmpleado = {
      nombre: "Nuevo",
      apellido: "Empleado",
      email: "nuevo@ejemplo.com",
      telefono: "+1234567890",
      fecha_contratacion: "2024-01-30",
    };

    it("should not allow non-admin users to create employees", async () => {
      const res = await request(app)
        .post("/api/empleados")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newEmpleado);

      expect(res.statusCode).toBe(403);
    });

    it("should allow admin to create new employee", async () => {
      const res = await request(app)
        .post("/api/empleados")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send(newEmpleado);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.nombre).toBe(newEmpleado.nombre);
    });
  });

  describe("DELETE /api/empleados/:id", () => {
    it("should not allow non-admin users to delete employees", async () => {
      const res = await request(app)
        .delete("/api/empleados/1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 404 for non-existent employee", async () => {
      const res = await request(app)
        .delete("/api/empleados/99999")
        .set("Authorization", `Bearer ${adminAuthToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
