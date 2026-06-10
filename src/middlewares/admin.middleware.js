const verificarAdmin = (req, res, next) => {
  if (req.userRol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

module.exports = verificarAdmin;