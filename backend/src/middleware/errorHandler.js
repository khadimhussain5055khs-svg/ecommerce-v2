export function notFoundHandler(req, res) {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  const status = error.statusCode || 500;
  return res.status(status).json({
    message: error.message || 'Internal server error',
  });
}
