// src/app.js
require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
const express = require("express");
const cors = require("cors");
const {
  limiter,
  helmetConfig,
  sanitizeData,
} = require("./src/middlewares/security.middleware");
const authRoutes = require("./src/routes/auth.routes");
const empleadosRoutes = require("./src/routes/empleados.routes");
const solicitudesRoutes = require("./src/routes/solicitudes.routes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());
app.use(helmetConfig);
app.use(limiter);
app.use(sanitizeData);
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message,
  });
});

module.exports = { app };

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}
