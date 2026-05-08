const { SubjectPrerequisite } = require('../models');

// 1. Listar todas las prelaciones
exports.list = async (req, res, next) => {
    try {
        const prerequisites = await SubjectPrerequisite.findAll({ limit: 100 });
        res.json(prerequisites);
    } catch (err) {
        next(err);
    }
};

// 2. Obtener una prelación específica por ID
exports.get = async (req, res, next) => {
    try {
        const prerequisite = await SubjectPrerequisite.findByPk(req.params.id);
        if (!prerequisite) {
            return res.status(404).json({ message: 'Prelación no encontrada' });
        }
        res.json(prerequisite);
    } catch (err) {
        next(err);
    }
};

// 3. Crear una nueva prelación (POST)
exports.create = async (req, res, next) => {
    try {
        // Extraemos los IDs de las materias involucradas
        const { id_subject, id_prerequisite_subject, type } = req.body;

        const newPrerequisite = await SubjectPrerequisite.create({ 
            id_subject, 
            id_prerequisite_subject, 
            type 
        });

        res.status(201).json(newPrerequisite);
    } catch (err) {
        next(err);
    }
};

// 4. Actualizar una prelación (PUT)
exports.update = async (req, res, next) => {
    try {
        const prerequisite = await SubjectPrerequisite.findByPk(req.params.id);
        if (!prerequisite) {
            return res.status(404).json({ message: 'Prelación no encontrada' });
        }

        const { id_subject, id_prerequisite_subject, type } = req.body;

        await prerequisite.update({ 
            id_subject, 
            id_prerequisite_subject, 
            type 
        });

        res.json(prerequisite);
    } catch (err) {
        next(err);
    }
};

// 5. Eliminar una prelación (DELETE)
exports.remove = async (req, res, next) => {
    try {
        const prerequisite = await SubjectPrerequisite.findByPk(req.params.id);
        if (!prerequisite) {
            return res.status(404).json({ message: 'Prelación no encontrada' });
        }

        await prerequisite.destroy();
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};