const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");
const pool = require("../config/database");

// Obtener todas las solicitudes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const isAdmin = req.user.rol === "administrador";
    let queryBase;
    let countQuery;
    let values = [];
    let countValues = [];

    if (isAdmin) {
      queryBase = `
        SELECT s.*, e.nombre, e.apellido, e.usuario_id 
        FROM solicitudes s 
        JOIN empleados e ON s.empleado_id = e.id 
        ORDER BY s.fecha_solicitud DESC
      `;
      countQuery = `
        SELECT COUNT(*) 
        FROM solicitudes s 
        JOIN empleados e ON s.empleado_id = e.id
      `;
    } else {
      queryBase = `
        SELECT s.*, e.nombre, e.apellido, e.usuario_id 
        FROM solicitudes s 
        JOIN empleados e ON s.empleado_id = e.id 
        WHERE e.usuario_id = $1
        ORDER BY s.fecha_solicitud DESC
      `;
      countQuery = `
        SELECT COUNT(*) 
        FROM solicitudes s 
        JOIN empleados e ON s.empleado_id = e.id 
        WHERE e.usuario_id = $1
      `;
      values.push(req.user.id);
      countValues.push(req.user.id);
    }

    // Agregar paginación al query base
    queryBase += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // Ejecutar ambos queries
    const [result, countResult] = await Promise.all([
      pool.query(queryBase, values),
      pool.query(countQuery, countValues),
    ]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva solicitud
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tipo_solicitud, descripcion } = req.body;
    console.log("Usuario autenticado id:", req.user.id);

    // Primero obtenemos la información del empleado vinculado al usuario
    const empleadoResult = await pool.query(
      `SELECT id, usuario_id, nombre, apellido 
       FROM empleados 
       WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (empleadoResult.rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Usamos el id de la tabla empleados para la relación en solicitudes
    const empleado_id = empleadoResult.rows[0].id;
    console.log("ID empleado a insertar:", empleado_id);
    console.log("usuario_id relacionado:", empleadoResult.rows[0].usuario_id);

    const result = await pool.query(
      `INSERT INTO solicitudes (
        empleado_id,
        tipo_solicitud, 
        descripcion
      ) VALUES ($1, $2, $3) 
      RETURNING *`,
      [empleado_id, tipo_solicitud, descripcion]
    );

    // Agregamos el nombre y apellido a la respuesta
    const solicitudCreada = {
      ...result.rows[0],
      nombre: empleadoResult.rows[0].nombre,
      apellido: empleadoResult.rows[0].apellido,
    };

    res.status(201).json(solicitudCreada);
  } catch (error) {
    console.error("Error creando solicitud:", error);
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

// solicitudes.routes.js
// Actualizar estado de solicitud (solo administradores)
router.patch("/:id/estado", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    if (!["pendiente", "aprobada", "rechazada"].includes(estado)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const result = await pool.query(
      `UPDATE solicitudes 
       SET estado = $1, fecha_resolucion = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// solicitudes.routes.js
// Ruta para estadísticas
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM solicitudes) as total_solicitudes,
        (SELECT COUNT(*) FROM solicitudes WHERE estado = 'pendiente') as solicitudes_pendientes,
        (SELECT COUNT(*) FROM empleados) as total_empleados
    `);

    res.json({
      totalSolicitudes: parseInt(stats.rows[0].total_solicitudes),
      solicitudesPendientes: parseInt(stats.rows[0].solicitudes_pendientes),
      totalEmpleados: parseInt(stats.rows[0].total_empleados),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para solicitudes recientes
router.get("/recientes", authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.rol === "administrador";

    const query = isAdmin
      ? `
        SELECT s.*, e.nombre, e.apellido 
        FROM solicitudes s 
        JOIN empleados e ON s.empleado_id = e.id 
        ORDER BY s.fecha_solicitud DESC 
        LIMIT 5
      `
      : `
        SELECT s.*, e.nombre, e.apellido 
        FROM solicitudes s 
        JOIN empleados e ON s.empleado_id = e.id 
        WHERE e.usuario_id = $1
        ORDER BY s.fecha_solicitud DESC 
        LIMIT 5
      `;

    const values = isAdmin ? [] : [req.user.id];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
