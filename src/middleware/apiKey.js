const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;

  // En desarrollo, si no hay API_KEY configurada, dejamos pasar (opcional)
  if (process.env.NODE_ENV === 'development' && !validApiKey) {
    return next();
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      ok: false,
      error: 'Acceso denegado: API Key inválida o ausente.',
      codigo: 'UNAUTHORIZED_API_KEY'
    });
  }

  next();
};

module.exports = apiKeyMiddleware;
