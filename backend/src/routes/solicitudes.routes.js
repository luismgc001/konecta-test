const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");
const pool = require("../config/database");

// Obtener todas las solicitudes (accesible para todos los usuarios autenticados)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT s.*, e.nombre, e.apellido 
            FROM solicitudes s 
            JOIN empleados e ON s.empleado_id = e.id 
            ORDER BY s.fecha_solicitud DESC
        `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva solicitud (accesible para todos los usuarios autenticados)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { empleado_id, tipo_solicitud, descripcion } = req.body;
    const result = await pool.query(
      "INSERT INTO solicitudes (empleado_id, tipo_solicitud, descripcion) VALUES ($1, $2, $3) RETURNING *",
      [empleado_id, tipo_solicitud, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar solicitud (solo administradores)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM solicitudes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json({ message: "Solicitud eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
