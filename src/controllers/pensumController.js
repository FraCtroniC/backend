/** Controlador REST de pensums. */
const { Pensum, Career, PensumSubject, Subject, Semester, SubjectPrerequisite } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const cacheService = require('../services/cacheService');

// 1. Listar todos los pensum
exports.list = async (req, res, next) => {
  try {
    const items = await Pensum.findAll({ 
      include: [
        {
          model: Career
        },
        {
          model: PensumSubject,
          include: [
            Subject, 
            Semester,
            {
              model: SubjectPrerequisite,
              as: 'Prerequisites',
              include: [
                {
                  model: PensumSubject,
                  as: 'RequiredPensumSubject',
                  include: [Subject]
                }
              ]
            }
          ]
        }
      ],
      order: [['id_pensum', 'ASC']] 
    });
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener un pensum por ID
exports.get = async (req, res, next) => {
  try {
    const item = await Pensum.findByPk(req.params.id, {
      include: [
        {
          model: Career
        },
        {
          model: PensumSubject,
          include: [
            Subject, 
            Semester,
            {
              model: SubjectPrerequisite,
              as: 'Prerequisites',
              include: [
                {
                  model: PensumSubject,
                  as: 'RequiredPensumSubject',
                  include: [Subject]
                }
              ]
            }
          ]
        }
      ]
    });
    if (!item) {
      return res.status(404).json({ message: 'Pensum no encontrado' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear nuevo pensum (POST)
exports.create = async (req, res, next) => {
  try {
    const { id_career, name_pensum, resolution_date, is_active } = req.body;
    
    const newItem = await Pensum.create({ 
      id_career, 
      name_pensum, 
      resolution_date, 
      is_active 
    });
    
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Pensum',
      recordId: newItem.id_pensum,
      newValue: `Pensum creado: ${name_pensum}`
    });
    
    await cacheService.invalidateTags(['pensums', 'careers']);
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar pensum (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await Pensum.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pensum no encontrado' });
    }

    const { id_career, name_pensum, resolution_date, is_active } = req.body;

    await item.update({ 
      id_career, 
      name_pensum, 
      resolution_date, 
      is_active 
    });

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Pensum',
      recordId: item.id_pensum,
      newValue: `Pensum actualizado: ${item.name_pensum}`
    });

    await cacheService.invalidateTags(['pensums', 'careers']);
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar pensum
exports.remove = async (req, res, next) => {
  try {
    const item = await Pensum.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pensum no encontrado' });
    }
    
    await item.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Pensum',
      recordId: item.id_pensum,
      newValue: `Pensum eliminado: ${item.name_pensum}`
    });

    await cacheService.invalidateTags(['pensums', 'careers']);
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};