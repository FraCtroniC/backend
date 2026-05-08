const { Role } = require('../models');

// 1. Listar todos los roles
exports.list = async (req, res, next) => {
  try {
    const roles = await Role.findAll({ order: [['id_role', 'ASC']] });
    res.json(roles);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener un rol por ID
exports.get = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json(role);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear rol (POST)
exports.create = async (req, res, next) => {
  try {
    const { name_role, description } = req.body;
    
    const newRole = await Role.create({ 
      name_role,
      description 
    });
    
    res.status(201).json(newRole);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar rol (PUT)
exports.update = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    const { name_role, description } = req.body;

    await role.update({ 
      name_role,
      description 
    });

    res.json(role);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar rol (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    await role.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};