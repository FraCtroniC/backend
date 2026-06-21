/** Controlador REST de detalles de inscripcion. */
const { RegistrationDetail, Section, Subject, Registration, Student, User } = require('../models');
const { logActivity } = require('../utils/auditLogger');

// 1. Listar todos los detalles de inscripción (Notas)
exports.list = async (req, res, next) => {
  try {
    const items = await RegistrationDetail.findAll();
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener nota por ID de detalle
exports.get = async (req, res, next) => {
  try {
    const item = await RegistrationDetail.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Cargar notas nuevas (POST)
exports.create = async (req, res, next) => {
  try {
    const { 
      id_registration, 
      id_section, 
      corte_1, 
      corte_2, 
      corte_3, 
      corte_4, 
      recuperatorio, 
      final_note, 
      attendance_percentage, 
      subject_status,
      grade_status
    } = req.body;
    
    const newItem = await RegistrationDetail.create({ 
      id_registration, 
      id_section, 
      corte_1, 
      corte_2, 
      corte_3, 
      corte_4, 
      recuperatorio, 
      final_note, 
      attendance_percentage, 
      subject_status,
      grade_status
    });

    try {
      const populated = await RegistrationDetail.findByPk(newItem.id_registration_detail || newItem.id, {
        include: [
          {
            model: Section,
            include: [{ model: Subject }]
          },
          {
            model: Registration,
            include: [{
              model: Student,
              include: [{ model: User }]
            }]
          }
        ]
      });

      if (populated) {
        const studentName = populated.Registration?.Student?.User 
          ? `${populated.Registration.Student.User.first_name} ${populated.Registration.Student.User.first_lastname}`
          : 'Estudiante';
        const subjectName = populated.Section?.Subject?.name_subject || 'Asignatura';
        const sectionCode = populated.Section?.section_code || 'A';

        await logActivity(req, {
          action: 'CREATE',
          tableAffected: 'Calificaciones',
          recordId: populated.id_registration_detail || populated.id,
          newValue: `Notas iniciales cargadas para ${studentName} en la asignatura ${subjectName} (Sección ${sectionCode})`
        });
      }
    } catch (logErr) {
      console.error('AuditLog grades create error:', logErr);
    }
    
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar notas o asistencia (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await RegistrationDetail.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }

    await item.update(req.body);

    try {
      const populated = await RegistrationDetail.findByPk(item.id_registration_detail || item.id, {
        include: [
          {
            model: Section,
            include: [{ model: Subject }]
          },
          {
            model: Registration,
            include: [{
              model: Student,
              include: [{ model: User }]
            }]
          }
        ]
      });

      if (populated) {
        const studentName = populated.Registration?.Student?.User 
          ? `${populated.Registration.Student.User.first_name} ${populated.Registration.Student.User.first_lastname}`
          : 'Estudiante';
        const subjectName = populated.Section?.Subject?.name_subject || 'Asignatura';
        const sectionCode = populated.Section?.section_code || 'A';
        
        let newValue = '';
        if (req.body.grade_status === 'Confirmada') {
          newValue = `Acta de notas confirmada para ${studentName} en la asignatura ${subjectName} (Sección ${sectionCode})`;
        } else {
          newValue = `Calificaciones cargadas/actualizadas para ${studentName} en la asignatura ${subjectName} (Sección ${sectionCode})`;
        }

        await logActivity(req, {
          action: 'UPDATE',
          tableAffected: 'Calificaciones',
          recordId: populated.id_registration_detail || populated.id,
          newValue
        });
      }
    } catch (logErr) {
      console.error('AuditLog grades update error:', logErr);
    }

    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar detalle
exports.remove = async (req, res, next) => {
  try {
    const item = await RegistrationDetail.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }
    
    await item.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};