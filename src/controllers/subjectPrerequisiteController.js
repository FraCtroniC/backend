/** Controlador REST de prerrequisitos de materias. */
const { SubjectPrerequisite } = require('../models');

function buildCreatePayload(body) {
    return {
        id_pensum_subject: body.id_pensum_subject ?? body.id_subject,
        id_required_pensum_subject: body.id_required_pensum_subject ?? body.id_prerequisite_subject,
    };
}

function buildUpdatePayload(body) {
    const payload = {};

    if (body.id_pensum_subject !== undefined || body.id_subject !== undefined) {
        payload.id_pensum_subject = body.id_pensum_subject ?? body.id_subject;
    }

    if (body.id_required_pensum_subject !== undefined || body.id_prerequisite_subject !== undefined) {
        payload.id_required_pensum_subject = body.id_required_pensum_subject ?? body.id_prerequisite_subject;
    }

    return payload;
}

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
        const payload = buildCreatePayload(req.body);
        const newPrerequisite = await SubjectPrerequisite.create(payload);

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

        const payload = buildUpdatePayload(req.body);

        await prerequisite.update(payload);

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