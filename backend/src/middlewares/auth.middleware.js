const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.rol !== "administrador") {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  next();
};

module.exports = { authMiddleware, isAdmin };
