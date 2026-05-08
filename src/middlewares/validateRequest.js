const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
    message: 'Error de validación',
    errors: errors.array().map(err => ({
        campo: err.path,
        mensaje: err.msg
    }))
});
  }
  next();
};
