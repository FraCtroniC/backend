/** Controlador REST de docentes. */
const { Teacher, User } = require('../models');

// 1. Listar todos los profesores
exports.list = async (req, res, next) => {
    try {
        const teachers = await Teacher.findAll({ 
            include: [{ model: User }],
            limit: 50 
        });
        res.json(teachers);
    } catch (err) {
        next(err);
    }
};

// 2. Obtener un profesor por su ID
exports.get = async (req, res, next) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        res.json(teacher);
    } catch (err) {
        next(err);
    }
};

// 3. Crear un nuevo profesor (El que probamos en Postman)
exports.create = async (req, res, next) => {
    try {
        // Aquí sacamos los campos específicos
        const { id_user, academic_grade, profession } = req.body;

        const newTeacher = await Teacher.create({ 
            id_user, 
            academic_grade, 
            profession 
        });

        res.status(201).json(newTeacher);
    } catch (err) {
        next(err);
    }
};

// 4. Actualizar datos de un profesor (PUT)
// Actualizar datos de un profesor (PUT)
exports.update = async (req, res, next) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }

        // Sacamos los campos que queremos permitir editar
        const { academic_grade, profession } = req.body;

        await teacher.update({ 
            academic_grade, 
            profession 
        });

        res.json(teacher);
    } catch (err) {
        next(err);
    }
};

// 5. Eliminar un profesor (DELETE)
exports.remove = async (req, res, next) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }

        await teacher.destroy();
        res.status(204).end(); // 204 significa "Todo bien, pero no hay nada que mostrar"
    } catch (err) {
        next(err);
    }
};
