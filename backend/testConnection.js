require("dotenv").config();
const { pool } = require("./src/config/database");

async function testConnection() {
  try {
    console.log("Intentando conectar a:", process.env.DATABASE_URL);
    const result = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa:", result.rows[0]);
  } catch (err) {
    console.error("Error de conexión:", err);
    console.error("Configuración actual:", {
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
  } finally {
    await pool.end();
  }
}

testConnection();
