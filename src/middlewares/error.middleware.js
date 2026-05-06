// src/middlewares/error.middleware.js
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({
    msg: 'Error interno del servidor',
    error: err.message
  });
}

module.exports = errorHandler;