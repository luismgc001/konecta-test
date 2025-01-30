const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    await pool.query("BEGIN");

    const {
      username,
      password,
      rol = rol || "empleado",
      nombre,
      apellido,
      email,
      telefono,
      fecha_contratacion,
      salario,
    } = req.body;

    const salarioNumerico = parseFloat(salario);
    if (isNaN(salarioNumerico)) {
      throw new Error("El salario debe ser un número válido");
    }

    // Verificaciones de existencia
    const [userExists, emailExists] = await Promise.all([
      pool.query("SELECT * FROM usuarios WHERE username = $1", [username]),
      pool.query("SELECT * FROM empleados WHERE email = $1", [email]),
    ]);

    if (userExists.rows.length > 0) {
      throw new Error("El nombre de usuario ya está en uso");
    }

    if (emailExists.rows.length > 0) {
      throw new Error("El email ya está registrado");
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const userResult = await pool.query(
      `INSERT INTO usuarios (username, password, rol)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [username, hashedPassword, rol]
    );

    const usuarioId = userResult.rows[0].id;
    // Insertar empleado
    const empleadoResult = await pool.query(
      `INSERT INTO empleados (
        usuario_id, nombre, apellido, 
        email, telefono, fecha_contratacion,
        salario
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        usuarioId,
        nombre,
        apellido,
        email,
        telefono,
        fecha_contratacion,
        salarioNumerico,
      ]
    );

    await pool.query("COMMIT");

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuarioId,
        username,
        rol,
        empleadoId: empleadoResult.rows[0].id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Responder con más detalles
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: usuarioId,
        username,
        rol,
        empleado: empleadoResult.rows[0],
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    await pool.query("ROLLBACK");

    res.status(400).json({
      message: error.message || "Error al registrar el usuario",
      error: error.toString(),
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Buscar usuario
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        rol: user.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
