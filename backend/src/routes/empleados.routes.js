const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth.middleware");
const pool = require("../config/database");
const { body, query, validationResult } = require("express-validator");

// Validaciones para crear empleado
const validateCreateEmpleado = [
  body("nombre").trim().notEmpty().escape(),
  body("apellido").trim().notEmpty().escape(),
  body("email").isEmail().normalizeEmail(),
  body("telefono")
    .trim()
    .matches(/^\+?[\d\s-]{8,}$/),
  body("fecha_contratacion").isDate(),
];

// Obtener empleados con paginación y filtros
router.get(
  "/",
  authMiddleware,
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().trim().escape(),
    query("orderBy").optional().isIn(["nombre", "fecha_contratacion"]),
    query("order").optional().isIn(["ASC", "DESC"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        page = 1,
        limit = 10,
        search = "",
        orderBy = "created_at",
        order = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir query base
      let query = "SELECT * FROM empleados";
      let countQuery = "SELECT COUNT(*) FROM empleados";
      let queryParams = [];

      // Agregar búsqueda si existe
      if (search) {
        query +=
          " WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR email ILIKE $1";
        countQuery +=
          " WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR email ILIKE $1";
        queryParams.push(`%${search}%`);
      }

      // Agregar ordenamiento
      query += ` ORDER BY ${orderBy} ${order}`;

      // Agregar paginación
      query +=
        " LIMIT $" +
        (queryParams.length + 1) +
        " OFFSET $" +
        (queryParams.length + 2);
      queryParams.push(limit, offset);

      // Ejecutar queries
      const [resultados, total] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, search ? [queryParams[0]] : []),
      ]);

      console.log(resultados);

      res.json({
        data: resultados.rows,
        pagination: {
          total: parseInt(total.rows[0].count),
          page,
          limit,
          totalPages: Math.ceil(total.rows[0].count / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Crear nuevo empleado (solo administradores)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, fecha_contratacion } = req.body;
    const result = await pool.query(
      "INSERT INTO empleados (nombre, apellido, email, telefono, fecha_contratacion) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, apellido, email, telefono, fecha_contratacion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Añadir esta nueva ruta en empleados.routes.js

// Eliminar empleado (solo administradores)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Primero verificamos si el empleado existe
    const empleado = await pool.query("SELECT * FROM empleados WHERE id = $1", [
      id,
    ]);

    if (empleado.rows.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Realizamos la eliminación
    await pool.query("DELETE FROM empleados WHERE id = $1", [id]);

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    // Si hay error de llave foránea, enviamos un mensaje más amigable
    if (error.code === "23503") {
      return res.status(400).json({
        message:
          "No se puede eliminar el empleado porque tiene registros asociados",
      });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
