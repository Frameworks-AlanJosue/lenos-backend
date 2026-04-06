// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      ok: false,
      mensaje: "Error de validación",
      errores: mensajes,
    });
  }

  // ID de MongoDB inválido
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      ok: false,
      mensaje: "ID no válido",
    });
  }

  res.status(statusCode).json({
    ok: false,
    mensaje: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
