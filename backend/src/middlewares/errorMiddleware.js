const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err.message === "NOT_FOUND") {
    return res.status(404).json({
      message: "Recurso no encontrado"
    });
  }

  res.status(500).json({
    message: "Error interno del servidor"
  });
};

module.exports = errorMiddleware;