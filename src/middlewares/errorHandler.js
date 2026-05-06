const { ValidationError } = require('sequelize');
const { validationResult } = require('express-validator');

function notFound(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // express-validator errors
  if (err && err.errors && Array.isArray(err.errors) && err.name === 'ValidationError') {
    return res.status(400).json({ errors: err.errors.map((e) => e.message) });
  }

  // Sequelize validation
  if (err instanceof ValidationError) {
    return res.status(400).json({ errors: err.errors.map((e) => e.message) });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
}

module.exports = { errorHandler, notFound };
