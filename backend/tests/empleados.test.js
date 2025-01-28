describe("Empleados Endpoints", () => {
  let authToken;

  beforeAll(async () => {
    // Obtener token para pruebas
    const loginRes = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });
    authToken = loginRes.body.token;
  });

  it("should get paginated employees", async () => {
    const res = await request(app)
      .get("/api/empleados?page=1&limit=10")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
  });
});
