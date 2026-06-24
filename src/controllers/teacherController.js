/** Controlador REST de docentes. */
const { Teacher, User, AcademicTitle } = require('../models');


// 1. Listar todos los profesores
exports.list = async (req, res, next) => {
    try {
        const teachers = await Teacher.findAll({ 
            include: [
                { model: User },
                { model: AcademicTitle }
            ],
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
        const teacher = await Teacher.findByPk(req.params.id, {
            include: [{ model: AcademicTitle }]
        });

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
        const { id_user, academic_grade, profession, id_academic_title } = req.body;

        let resolvedTitleId = id_academic_title || null;
        let resolvedGrade = academic_grade;
        if (!resolvedTitleId && academic_grade) {
            const { Op } = require('sequelize');
            const titleRecord = await AcademicTitle.findOne({
                where: { name_title: { [Op.iLike]: academic_grade.trim() } }
            });
            if (titleRecord) {
                resolvedTitleId = titleRecord.id_academic_title;
                resolvedGrade = titleRecord.name_title;
            }
        } else if (resolvedTitleId) {
            const titleRecord = await AcademicTitle.findByPk(resolvedTitleId);
            if (titleRecord) {
                resolvedGrade = titleRecord.name_title;
            }
        }

        const newTeacher = await Teacher.create({ 
            id_user, 
            id_academic_title: resolvedTitleId,
            academic_grade: resolvedGrade, 
            profession: profession || resolvedGrade 
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
        const { academic_grade, profession, id_academic_title } = req.body;

        let resolvedTitleId = id_academic_title !== undefined ? id_academic_title : teacher.id_academic_title;
        let resolvedGrade = academic_grade || teacher.academic_grade;
        if (id_academic_title === undefined && academic_grade) {
            const { Op } = require('sequelize');
            const titleRecord = await AcademicTitle.findOne({
                where: { name_title: { [Op.iLike]: academic_grade.trim() } }
            });
            if (titleRecord) {
                resolvedTitleId = titleRecord.id_academic_title;
                resolvedGrade = titleRecord.name_title;
            }
        } else if (id_academic_title) {
            const titleRecord = await AcademicTitle.findByPk(id_academic_title);
            if (titleRecord) {
                resolvedGrade = titleRecord.name_title;
            }
        }

        await teacher.update({ 
            id_academic_title: resolvedTitleId,
            academic_grade: resolvedGrade, 
            profession: profession || resolvedGrade 
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
