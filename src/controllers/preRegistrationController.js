const { PreRegistration, User, Role, State, Municipality, Parish, Career, Semester } = require('../models');
const { sendEmail } = require('../services/emailService');
const config = require('../config/env');

exports.list = async (req, res, next) => {
  try {
    const items = await PreRegistration.findAll({
      include: [
        { model: State, attributes: ['id_state', 'name_state'] },
        { model: Municipality, attributes: ['id_municipality', 'name_municipality'] },
        { model: Parish, attributes: ['id_parish', 'name_parish'] },
        { model: Career, attributes: ['id_career', 'name_career'] },
        { model: Semester, attributes: ['id_semester', 'number_semester'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await PreRegistration.findByPk(req.params.id, {
      include: [
        { model: State, attributes: ['id_state', 'name_state'] },
        { model: Municipality, attributes: ['id_municipality', 'name_municipality'] },
        { model: Parish, attributes: ['id_parish', 'name_parish'] },
        { model: Career, attributes: ['id_career', 'name_career'] },
        { model: Semester, attributes: ['id_semester', 'number_semester'] }
      ]
    });
    if (!item) {
      return res.status(404).json({ message: 'Pre-registro no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await PreRegistration.create(req.body);
    res.status(201).json(item);

    // Notificar por correo a los administradores que hay un nuevo preregistro pendiente
    (async () => {
      try {
        let toList = [];

        // 1) Preferir lista de correos desde la variable de entorno ADMIN_NOTIFICATION_EMAILS
        if (config && config.adminNotificationEmails) {
          toList = config.adminNotificationEmails
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }

        // 2) Si no hay lista en env, consultar usuarios con rol Admin en la BD
        if (toList.length === 0) {
          const admins = await User.findAll({
            include: [
              {
                model: Role,
                where: { name_role: 'Admin' },
                attributes: [],
              },
            ],
            where: {
              email: { [require('sequelize').Op.ne]: null },
            },
          });

          toList = admins.map((a) => a.email).filter(Boolean);
        }

        if (toList.length === 0) return;

        const aspirantName = [
          item.first_name,
          item.second_name,
          item.first_lastname,
          item.second_lastname,
        ]
          .filter(Boolean)
          .join(' ');

        const reviewUrl = (config && config.frontendUrl)
          ? `${config.frontendUrl}/admin/pre-registrations/${item.id_pre}`
          : `#/admin/pre-registrations/${item.id_pre}`;

        const subject = `Nuevo pre-registro pendiente (#${item.id_pre})`;

        const text = `Se ha recibido un nuevo pre-registro.\n\n` +
          `Aspirante: ${aspirantName || 'N/D'}\n` +
          `Documento: ${item.document_type}-${item.document_id}\n` +
          `ID pre-registro: ${item.id_pre}\n\n` +
          `Revisa el preregistro: ${reviewUrl}`;

        const html = `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #222;">
            <h2 style="color: #0b5ed7;">Nuevo pre-registro pendiente</h2>
            <p>Se ha recibido un nuevo pre-registro que requiere revisión por parte del equipo administrativo.</p>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #e9ecef;"><strong>Aspirante</strong></td>
                <td style="padding: 8px; border: 1px solid #e9ecef;">${aspirantName || 'N/D'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e9ecef;"><strong>Documento</strong></td>
                <td style="padding: 8px; border: 1px solid #e9ecef;">${item.document_type}-${item.document_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e9ecef;"><strong>ID</strong></td>
                <td style="padding: 8px; border: 1px solid #e9ecef;">${item.id_pre}</td>
              </tr>
            </table>
            <p style="margin-top:16px;">Accede al preregistro para revisarlo:</p>
            <p><a href="${reviewUrl}" style="display:inline-block;padding:10px 14px;background:#0b5ed7;color:#fff;border-radius:4px;text-decoration:none;">Ver preregistro</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin-top:20px;" />
            <p style="font-size:12px;color:#666;">Este correo fue generado automáticamente. No responda a este mensaje.</p>
          </div>`;

        await sendEmail({ to: toList.join(','), subject, text, html });
      } catch (err) {
        // No interrumpir el flujo de creación por fallos en el envío de correo
        console.error('Error enviando notificacion de preregistro a admins:', err.message || err);
      }
    })();
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await PreRegistration.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pre-registro no encontrado' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await PreRegistration.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pre-registro no encontrado' });
    }

    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};