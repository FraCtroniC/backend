const { ValidationError } = require('sequelize');
const { ZodError } = require('zod');

function notFound(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // JSON parse errors in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'JSON inválido en el cuerpo de la petición',
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: err.issues.map((issue) => ({
        campo: issue.path.join('.') || 'request',
        mensaje: issue.message,
      })),
    });
  }

  // express-validator errors
  if (err && err.errors && Array.isArray(err.errors) && err.name === 'ValidationError') {
    return res.status(400).json({ errors: err.errors.map((e) => e.message) });
  }

  // JWT errors
  if (err && err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expirado' });
  }

  if (err && err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido' });
  }

  // Sequelize validation
  if (err instanceof ValidationError) {
    return res.status(400).json({ errors: err.errors.map((e) => e.message) });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
}

module.exports = { errorHandler, notFound };
