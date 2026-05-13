/** Controlador REST de estudiantes. */
const { Student } = require('../models');

// 1. Listar todos los estudiantes
exports.list = async (req, res, next) => {
  try {
    // Los listamos por fecha de admisión, lo más nuevo primero
    const students = await Student.findAll({ order: [['admission_date', 'DESC']] });
    res.json(students);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener un estudiante por ID (id_student)
exports.get = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id);
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
    const { id_user, id_career, current_semester, status, admission_date } = req.body;
    
    const newStudent = await Student.create({ 
      id_user, 
      id_career, 
      current_semester, 
      status, 
      admission_date 
    });
    
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
    const { id_career, current_semester, status, admission_date } = req.body;

    await student.update({ 
      id_career, 
      current_semester, 
      status, 
      admission_date 
    });

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
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};