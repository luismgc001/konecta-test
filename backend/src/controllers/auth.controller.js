const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const register = async (req, res) => {
  try {
    const { username, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar nuevo usuario
    const result = await pool.query(
      "INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3) RETURNING id, username, rol",
      [username, hashedPassword, rol]
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
