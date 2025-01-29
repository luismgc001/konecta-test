// testConnection.js
const pool = require("./src/config/database");

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa:", result.rows[0]);
  } catch (err) {
    console.error("Error de conexión:", err);
  } finally {
    pool.end();
  }
}

testConnection();
