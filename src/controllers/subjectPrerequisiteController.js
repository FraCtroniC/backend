/** Controlador REST de prerrequisitos de materias. */
const { SubjectPrerequisite } = require('../models');
const { logActivity } = require('../utils/auditLogger');

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

    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Prelación',
      recordId: newPrerequisite.id_prerequisite,
      newValue: `Prelación creada (pensum_subject: ${payload.id_pensum_subject} requiere: ${payload.id_required_pensum_subject})`
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

        const payload = buildUpdatePayload(req.body);

    await prerequisite.update(payload);

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Prelación',
      recordId: prerequisite.id_prerequisite,
      newValue: `Prelación actualizada (id: ${prerequisite.id_prerequisite})`
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

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Prelación',
      recordId: prerequisite.id_prerequisite,
      newValue: `Prelación eliminada (id: ${prerequisite.id_prerequisite})`
    });

    res.status(204).end();
    } catch (err) {
        next(err);
    }
};