/** Controlador REST de materias. */
const { Subject, PensumSubject, Pensum, Career, SubjectPrerequisite } = require('../models');
const { logActivity } = require('../utils/auditLogger');

// 1. Listar todas las materias
exports.list = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({ order: [['name_subject', 'ASC']] });
    res.json(subjects);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una materia por ID
exports.get = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    res.json(subject);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear materia (POST)
exports.create = async (req, res, next) => {
  try {
    const { code_subject, name_subject, credit_units, id_pensum, id_semester, id_prerequisite_pensum_subject, id_prerequisites } = req.body;
    
    // 1. Buscar si ya existe la materia a nivel global (por su código único)
    let subject = await Subject.findOne({ where: { code_subject } });
    
    if (!subject) {
      subject = await Subject.create({ 
        code_subject, 
        name_subject, 
        credit_units 
      });
    }
    
    let pensumSubject = null;
    
    // 2. Si se especifica pensum y semestre, registrar la relación en pensum_subject
    if (id_pensum && id_semester) {
      const pensum = await Pensum.findByPk(id_pensum, {
        include: [{ model: Career }]
      });
      
      if (!pensum) {
        return res.status(404).json({ message: 'Pensum no encontrado' });
      }
      
      const careerCode = pensum.Career ? pensum.Career.code_career : 'CAR';
      const combinedCode = `${careerCode}-${code_subject}`;
      
      // Validar si ya existe esta asociación específica materia-pensum
      const existingRelation = await PensumSubject.findOne({
        where: {
          id_pensum,
          id_subject: subject.id_subject
        }
      });
      
      if (existingRelation) {
        return res.status(400).json({ message: 'La materia ya está asociada a este pensum' });
      }
      
      // Validar si el código combinado ya está en uso en este pensum
      const existingCodeRelation = await PensumSubject.findOne({
        where: {
          id_pensum,
          code_subject: combinedCode
        }
      });
      
      if (existingCodeRelation) {
        return res.status(400).json({ message: `El código ${combinedCode} ya está en uso en este pensum` });
      }
      
      pensumSubject = await PensumSubject.create({
        id_pensum,
        id_subject: subject.id_subject,
        id_semester,
        code_subject: combinedCode
      });

      // 3. Registrar prerrequisitos (individuales o múltiples)
      const prereqIds = [];
      if (id_prerequisite_pensum_subject) {
        prereqIds.push(Number(id_prerequisite_pensum_subject));
      }
      if (Array.isArray(id_prerequisites)) {
        id_prerequisites.forEach((id) => {
          const numId = Number(id);
          if (numId && !prereqIds.includes(numId)) {
            prereqIds.push(numId);
          }
        });
      }

      for (const reqId of prereqIds) {
        const exists = await SubjectPrerequisite.findOne({
          where: {
            id_pensum_subject: pensumSubject.id_pensum_subject,
            id_required_pensum_subject: reqId
          }
        });
        if (!exists) {
          await SubjectPrerequisite.create({
            id_pensum_subject: pensumSubject.id_pensum_subject,
            id_required_pensum_subject: reqId
          });
        }
      }
    }
    
    // Devolvemos el subject creado/reutilizado y la relación si se creó
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Materia',
      recordId: subject.id_subject,
      newValue: `Materia creada: ${subject.name_subject} (${subject.code_subject})${pensumSubject ? ` - asociada al pensum` : ''}`
    });

    res.status(201).json({
      ...subject.toJSON(),
      pensumSubject
    });
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar materia (PUT)
exports.update = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    // Extraemos los campos para la actualización
    const { code_subject, name_subject, credit_units } = req.body;

    await subject.update({ 
      code_subject, 
      name_subject, 
      credit_units 
    });

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Materia',
      recordId: subject.id_subject,
      newValue: `Materia actualizada: ${subject.name_subject} (${subject.code_subject})`
    });

    res.json(subject);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar materia (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    
    await subject.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Materia',
      recordId: subject.id_subject,
      newValue: `Materia eliminada: ${subject.name_subject} (${subject.code_subject})`
    });

    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};