const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { body } = require("express-validator");

// Validaciones para el registro
const validateRegister = [
  // Validaciones para usuario
  body("username")
    .trim()
    .isLength({ min: 4 })
    .withMessage("El username debe tener al menos 4 caracteres")
    .escape(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol")
    .optional()
    .isIn(["empleado", "administrador"])
    .withMessage("Rol no válido"),

  // Validaciones para empleado
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .escape(),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .escape(),
  body("email").isEmail().withMessage("Email no válido").normalizeEmail(),
  body("telefono")
    .trim()
    .matches(/^\+?[\d\s-]{8,}$/)
    .withMessage("Número de teléfono no válido"),
  body("fecha_contratacion")
    .optional()
    .isDate()
    .withMessage("Fecha de contratación no válida"),
  body("salario")
    .notEmpty()
    .withMessage("El salario es requerido")
    .isFloat({ min: 0 })
    .withMessage("El salario debe ser un número positivo")
    .toFloat(),
];

router.post("/register", validateRegister, register);
router.post("/login", login);

module.exports = router;
