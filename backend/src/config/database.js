const { Pool } = require("pg");

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Necesario para conexiones SSL a Supabase
      },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(config);

// Verificar conexión
pool.on("connect", () => {
  console.log("Base de datos conectada exitosamente");
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de conexiones:", err);
});

module.exports = pool;
