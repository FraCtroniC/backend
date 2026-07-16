/** Controlador REST de materias por pensum. */
const { PensumSubject, SubjectPrerequisite, Subject, User, Section } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const { Op } = require('sequelize');
const { verifyPassword } = require('../services/passwordService');
const cacheService = require('../services/cacheService');

// 1. Listar todas las materias de los pensum
exports.list = async (req, res, next) => {
  try {
    // Los ordenamos por semestre para que el pensum se vea organizado
    const items = await PensumSubject.findAll({ 
      order: [['id_semester', 'ASC'], ['id_pensum', 'ASC']] 
    });
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una relación específica por ID
exports.get = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación Pensum-Materia no encontrada' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Asignar materia a un pensum (POST)
exports.create = async (req, res, next) => {
  try {
    const { id_pensum, id_subject, id_semester, code_subject } = req.body;
    
    const newItem = await PensumSubject.create({ 
      id_pensum, 
      id_subject, 
      id_semester,
      code_subject,
    });
    
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Pensum-Materia',
      recordId: newItem.id_pensum_subject,
      newValue: `Materia asignada al pensum (id_pensum: ${id_pensum}, code: ${code_subject})`
    });
    
    await cacheService.invalidateTags(['pensums', 'subjects']);
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar semestre o materia (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    const { id_pensum, id_subject, id_semester, code_subject } = req.body;

    await item.update({ 
      id_pensum, 
      id_subject, 
      id_semester,
      code_subject,
    });

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Pensum-Materia',
      recordId: item.id_pensum_subject,
      newValue: `Relación pensum-materia actualizada (id_pensum: ${id_pensum}, code: ${code_subject})`
    });

    await cacheService.invalidateTags(['pensums', 'subjects']);
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar materia del pensum (DELETE)
//    Query param opcional: ?full=true  elimina también la materia global si no está en uso
exports.remove = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }
    
    const subjectId = item.id_subject;

    // Si es eliminación completa, validar todo antes de borrar
    if (req.query.full === 'true') {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: 'Debe ingresar su contraseña de administrador' });
      }

      const admin = await User.findByPk(req.auth.sub);
      if (!admin) {
        return res.status(404).json({ message: 'Usuario administrador no encontrado' });
      }

      const passwordValida = verifyPassword(password, admin.password_hash);
      if (!passwordValida) {
        return res.status(403).json({ message: 'Contraseña de administrador incorrecta' });
      }

      const otrasRelaciones = await PensumSubject.count({
        where: {
          id_subject: subjectId,
          id_pensum_subject: { [Op.ne]: item.id_pensum_subject }
        }
      });

      if (otrasRelaciones > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar la materia porque está siendo usada en otros pensums'
        });
      }

      // Verificar que no tenga secciones (materias cursando)
      const seccionesUsando = await Section.count({
        where: { id_subject: subjectId }
      });

      if (seccionesUsando > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar la materia porque tiene secciones registradas'
        });
      }
    }

    // Validaciones pasadas — proceder a eliminar
    await SubjectPrerequisite.destroy({
      where: {
        [Op.or]: [
          { id_pensum_subject: item.id_pensum_subject },
          { id_required_pensum_subject: item.id_pensum_subject }
        ]
      }
    });

    await item.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Pensum-Materia',
      recordId: item.id_pensum_subject,
      newValue: `Materia eliminada del pensum (code: ${item.code_subject})`
    });

    // Si era completa, eliminar también la materia global
    if (req.query.full === 'true') {
      const subject = await Subject.findByPk(subjectId);
      if (subject) {
        await subject.destroy();
        await logActivity(req, {
          action: 'DELETE',
          tableAffected: 'Materia',
          recordId: subjectId,
          newValue: `Materia eliminada completamente: ${subject.name_subject} (${subject.code_subject})`
        });
      }
    }

    await cacheService.invalidateTags(['pensums', 'subjects']);
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};

// 6. Eliminar materia del pensum y la materia global (vía POST, más fiable que DELETE con body)
exports.fullRemove = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Debe ingresar su contraseña de administrador' });
    }

    const admin = await User.findByPk(req.auth.sub);
    if (!admin) {
      return res.status(404).json({ message: 'Usuario administrador no encontrado' });
    }

    const passwordValida = verifyPassword(password, admin.password_hash);
    if (!passwordValida) {
      return res.status(403).json({ message: 'Contraseña de administrador incorrecta' });
    }

    const subjectId = item.id_subject;

    // Verificar que no esté en otros pensums
    const otrasRelaciones = await PensumSubject.count({
      where: {
        id_subject: subjectId,
        id_pensum_subject: { [Op.ne]: item.id_pensum_subject }
      }
    });

    if (otrasRelaciones > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la materia porque está siendo usada en otros pensums'
      });
    }

    // Verificar que no tenga secciones (materias cursando)
    const seccionesUsando = await Section.count({
      where: { id_subject: subjectId }
    });

    if (seccionesUsando > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la materia porque tiene secciones registradas'
      });
    }

    // Eliminar prelaciones
    await SubjectPrerequisite.destroy({
      where: {
        [Op.or]: [
          { id_pensum_subject: item.id_pensum_subject },
          { id_required_pensum_subject: item.id_pensum_subject }
        ]
      }
    });

    // Eliminar la relación pensum-materia
    await item.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Pensum-Materia',
      recordId: item.id_pensum_subject,
      newValue: `Materia eliminada del pensum (code: ${item.code_subject})`
    });

    // Eliminar la materia global
    const subject = await Subject.findByPk(subjectId);
    if (subject) {
      await subject.destroy();
      await logActivity(req, {
        action: 'DELETE',
        tableAffected: 'Materia',
        recordId: subjectId,
        newValue: `Materia eliminada completamente: ${subject.name_subject} (${subject.code_subject})`
      });
    }

    await cacheService.invalidateTags(['pensums', 'subjects']);
    res.status(200).json({ message: 'Materia eliminada exitosamente' });
  } catch (err) { 
    next(err); 
  }
};