require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Verificar conexión
pool.on("connect", () => {
  console.log("Base de datos conectada exitosamente");
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de conexiones:", err);
});

// Función helper para ejecutar queries
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error("Error ejecutando query", { text, error });
    throw error;
  }
};

module.exports = {
  pool,
  query,
};
