/** Controlador REST de estudiantes. */
const { Student, User, Career, Semester } = require('../models');
const cacheService = require('../services/cacheService');

const studentAssociations = [
  {
    model: User,
    attributes: ['id_user', 'first_name', 'second_name', 'first_lastname', 'second_lastname', 'document_id', 'email', 'status']
  },
  {
    model: Career,
    attributes: ['id_career', 'name_career', 'code_career']
  },
  {
    model: Semester,
    attributes: ['id_semester', 'number_semester', 'name_semester']
  }
];

// 1. Listar todos los estudiantes
exports.list = async (req, res, next) => {
  try {
    const students = await Student.findAll({ 
      order: [['admission_date', 'DESC']],
      include: studentAssociations
    });
    res.json(students);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener un estudiante por ID (id_student)
exports.get = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: studentAssociations
    });
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.json(student);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear estudiante (POST)
exports.create = async (req, res, next) => {
  try {
    // Extraemos tus campos específicos
    const { id_user, id_career, id_semester, status, admission_date } = req.body;
    
    const newStudent = await Student.create({ 
      id_user, 
      id_career, 
      id_semester,
      status, 
      admission_date 
    });
    
    await cacheService.invalidateTags(['students', 'users']);
    res.status(201).json(newStudent);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar estudiante (PUT)
exports.update = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Permitimos actualizar carrera, semestre y estatus
    const { id_career, id_semester, status, admission_date } = req.body;

    await student.update({ 
      id_career, 
      id_semester,
      status, 
      admission_date 
    });

    await cacheService.invalidateTags(['students', 'users']);
    res.json(student);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar estudiante (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    await student.destroy();
    await cacheService.invalidateTags(['students', 'users']);
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};