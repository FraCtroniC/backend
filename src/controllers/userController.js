const { User } = require('../models');

// 1. Listar todos los usuarios (máximo 50)
exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll({ limit: 50 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// 2. Obtener un usuario específico por su ID (UUID)
exports.get = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// 3. Crear un nuevo usuario
exports.create = async (req, res, next) => {
  try {
    const { id_role, document_id, username, password_hash, name, lastname, email, status } = req.body;
    const user = await User.create({ 
        id_role, 
        document_id, 
        username, 
        password_hash, 
        name, 
        lastname, 
        email, 
        status 
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // AGREGAMOS password_hash AQUÍ ABAJO:
    const { id_role, username, password_hash, name, lastname, email, status } = req.body;

    await user.update({ 
        id_role, 
        username, 
        password_hash, // Y AQUÍ TAMBIÉN
        name, 
        lastname, 
        email, 
        status 
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
// 5. Eliminar un usuario (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.status(204).end(); // Todo bien, pero no hay contenido que devolver
  } catch (err) {
    next(err);
  }
};