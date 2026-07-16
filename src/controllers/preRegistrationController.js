const { randomBytes } = require('crypto');
const { PreRegistration, User, Role, State, Municipality, Parish, Career, Semester, Student } = require('../models');
const { sendEmail } = require('../services/emailService');
const config = require('../config/env');
const { hashPassword } = require('../services/passwordService');
const { logActivity } = require('../utils/auditLogger');
const NotificationService = require('../services/notificationService');

async function generateVerificationCode() {
  let code = '';
  let existingItem = null;

  do {
    code = `PR-${randomBytes(4).toString('hex').toUpperCase()}`;
    existingItem = await PreRegistration.findOne({ where: { verification_code: code } });
  } while (existingItem);

  return code;
}

function buildStyledEmail({ title, subtitle, intro, body, detailsTitle, detailsRows, ctaLabel, ctaUrl, closing }) {
  const detailsHtml = detailsRows && detailsRows.length > 0
    ? `
                      <div style="background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;padding:18px 20px;margin-bottom:26px;">
                        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:12px;">${detailsTitle}</div>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                          ${detailsRows.map((row, index) => `
                          <tr>
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;width:40%;${index < detailsRows.length - 1 ? 'border-bottom:1px solid #e2e8f0;' : ''}">${row.label}</td>
                            <td style="padding:8px 10px;color:#0f172a;${index < detailsRows.length - 1 ? 'border-bottom:1px solid #e2e8f0;' : ''}">${row.value}</td>
                          </tr>`).join('')}
                        </table>
                      </div>`
    : '';

  const ctaHtml = ctaLabel && ctaUrl
    ? `
                      <div style="text-align:center;margin-bottom:28px;">
                        <a href="${ctaUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 10px 20px rgba(37,99,235,0.18);">${ctaLabel}</a>
                      </div>`
    : '';

  return `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0;padding:0;width:100%;background:#f4f7fb;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(15,23,42,0.12);font-family:Arial,Helvetica,sans-serif;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:32px 40px;color:#ffffff;text-align:center;">
                      <div style="font-size:13px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.9;margin-bottom:8px;">Portal Académico UPTNT</div>
                      <div style="font-size:30px;line-height:1.2;font-weight:700;">${title}</div>
                      <div style="font-size:15px;line-height:1.6;margin-top:12px;opacity:0.95;">
                        ${subtitle}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 40px 24px;color:#0f172a;">
                      <div style="font-size:16px;line-height:1.7;margin-bottom:18px;">
                        Estimado(a) <strong>${intro}</strong>,
                      </div>
                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">
                        ${body}
                      </div>
                      ${detailsHtml}
                      ${ctaHtml}
                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-top:24px;">
                        ${closing}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 40px 32px;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
                      Este es un correo electrónico generado automáticamente. Por favor no respondas a esta dirección.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `;
}

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const { search, status_pre } = req.query;

    const where = {
      [require('sequelize').Op.or]: [
        { observations: null },
        { observations: { [require('sequelize').Op.notLike]: '%[[SOFT_DELETED]]%' } },
      ],
    };

    if (status_pre && status_pre !== 'Todos') {
      where.status_pre = status_pre;
    } else {
      where.status_pre = { [require('sequelize').Op.ne]: 'Aprobado' };
    }

    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      const searchConditions = searchTerms.map(term => ({
        [require('sequelize').Op.or]: [
          { document_id: { [require('sequelize').Op.iLike]: `%${term}%` } },
          { first_name: { [require('sequelize').Op.iLike]: `%${term}%` } },
          { second_name: { [require('sequelize').Op.iLike]: `%${term}%` } },
          { first_lastname: { [require('sequelize').Op.iLike]: `%${term}%` } },
          { second_lastname: { [require('sequelize').Op.iLike]: `%${term}%` } },
          { email: { [require('sequelize').Op.iLike]: `%${term}%` } }
        ]
      }));
      
      where[require('sequelize').Op.and] = [
        ...(where[require('sequelize').Op.and] || []),
        ...searchConditions
      ];
    }

    const { count, rows } = await PreRegistration.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: State, attributes: ['id_state', 'name_state'] },
        { model: Municipality, attributes: ['id_municipality', 'name_municipality'] },
        { model: Parish, attributes: ['id_parish', 'name_parish'] },
        { model: Career, attributes: ['id_career', 'name_career'] },
        { model: Semester, attributes: ['id_semester', 'number_semester'] }
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
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
    if (!item || (item.observations || '').includes('[[SOFT_DELETED]]')) {
      return res.status(404).json({ message: 'Pre-registro no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const verificationCode = await generateVerificationCode();
    const item = await PreRegistration.create({
      ...req.body,
      verification_code: verificationCode,
    });

    try {
      let careerName = 'Carrera por definir';
      if (item.id_career) {
        const c = await Career.findByPk(item.id_career);
        if (c) careerName = c.name_career;
      }
      await logActivity(req, {
        action: 'CREATE',
        tableAffected: 'Preinscripción',
        recordId: item.id_pre,
        newValue: `Preinscripción de ${item.first_name} ${item.first_lastname} registrada para la carrera de ${careerName}`
      });
    } catch (logErr) {
      console.error('AuditLog create error:', logErr);
    }

    res.status(201).json(item);

    // Notificar a los administradores vía campanita
    NotificationService.notifyAdmins(
      'Nuevo Pre-registro',
      `El aspirante ${item.first_name} ${item.first_lastname} ha enviado su formulario.`,
      'info',
      `/admin/pre-registrations/${item.id_pre}`
    );

    // Notificar por correo a los administradores que hay un nuevo preregistro pendiente
    (async () => {
      try {
        const emailSet = new Set();

        // 1) Consultar usuarios con rol Admin en la BD
        try {
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
          admins.forEach((a) => {
            if (a.email) {
              emailSet.add(a.email.trim().toLowerCase());
            }
          });
        } catch (dbErr) {
          console.error('Error buscando admins en la BD para notificacion:', dbErr.message || dbErr);
        }

        // 2) Incluir lista de correos adicionales desde la variable de entorno ADMIN_NOTIFICATION_EMAILS
        if (config && config.adminNotificationEmails) {
          config.adminNotificationEmails
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
            .forEach((email) => emailSet.add(email));
        }

        const toList = Array.from(emailSet);

        if (toList.length === 0) return;

        const aspirantName = [
          item.first_name,
          item.second_name,
          item.first_lastname,
          item.second_lastname,
        ]
          .filter(Boolean)
          .join(' ');

        const publicCode = item.verification_code;

        const reviewUrl = (config && config.frontendUrl)
          ? `${config.frontendUrl}/admin/pre-registrations/${item.id_pre}`
          : `#/admin/pre-registrations/${item.id_pre}`;

        const subject = `Nuevo pre-registro pendiente (${publicCode})`;

        const text = `Se ha recibido un nuevo pre-registro.\n\n` +
          `Aspirante: ${aspirantName || 'N/D'}\n` +
          `Documento: ${item.document_type}-${item.document_id}\n` +
          `Código de pre-registro: ${publicCode}\n\n` +
          `Revisa el preregistro: ${reviewUrl}`;

        const html = `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0;padding:0;width:100%;background:#f4f7fb;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(15,23,42,0.12);font-family:Arial,Helvetica,sans-serif;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:32px 40px;color:#ffffff;">
                      <div style="font-size:13px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.9;margin-bottom:8px;">Portal Académico UPTNT</div>
                      <div style="font-size:28px;line-height:1.2;font-weight:700;">Nuevo pre-registro pendiente</div>
                      <div style="font-size:15px;line-height:1.6;margin-top:12px;opacity:0.95;">
                        Se ha recibido un nuevo pre-registro que requiere revisión.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 40px 24px;color:#0f172a;">
                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">
                        Se ha recibido un nuevo pre-registro que requiere revisión por parte del equipo administrativo.
                      </div>
                      <div style="background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;padding:18px 20px;margin-bottom:26px;">
                        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:12px;">Datos del aspirante</div>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                          <tr>
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;width:40%;border-bottom:1px solid #e2e8f0;">Aspirante</td>
                            <td style="padding:8px 10px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${aspirantName || 'N/D'}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Documento</td>
                            <td style="padding:8px 10px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${item.document_type}-${item.document_id}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;">Código</td>
                            <td style="padding:8px 10px;color:#0f172a;">${publicCode}</td>
                          </tr>
                        </table>
                      </div>
                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">Accede al panel para revisar y gestionar la solicitud:</div>
                      <div style="text-align:center;margin-bottom:28px;">
                        <a href="${reviewUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 10px 20px rgba(37,99,235,0.18);">Ver pre-registro</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 40px 32px;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
                      Este correo fue generado automáticamente. No responda a este mensaje.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>`;

        await sendEmail({
          to: toList.join(','),
          subject,
          text,
          html,
          emailType: 'admin_notif',
          emailParams: {
            aspirantName,
            document: `${item.document_type}-${item.document_id}`,
            verificationCode: publicCode,
            reviewUrl,
          },
        });
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

    const oldStatus = item.status_pre;
    const newStatus = req.body.status_pre;

    await item.update(req.body);

    try {
      if (newStatus === 'Aprobado' && oldStatus !== 'Aprobado') {
        await logActivity(req, {
          action: 'UPDATE',
          tableAffected: 'Preinscripción',
          recordId: item.id_pre,
          newValue: `Preinscripción aprobada para ${item.first_name} ${item.first_lastname} (${item.document_type}-${item.document_id}). Cuenta de acceso creada.`
        });
      } else if (newStatus === 'Rechazado' && oldStatus !== 'Rechazado') {
        await logActivity(req, {
          action: 'UPDATE',
          tableAffected: 'Preinscripción',
          recordId: item.id_pre,
          newValue: `Preinscripción rechazada para ${item.first_name} ${item.first_lastname} (${item.document_type}-${item.document_id})`
        });
      } else {
        await logActivity(req, {
          action: 'UPDATE',
          tableAffected: 'Preinscripción',
          recordId: item.id_pre,
          newValue: `Modificado el estado de preinscripción de ${item.first_name} ${item.first_lastname} a "${newStatus || 'Modificado'}"`
        });
      }
    } catch (logErr) {
      console.error('AuditLog update error:', logErr);
    }

    // Si pasa a Aprobado y antes no lo estaba
    if (newStatus === 'Aprobado' && oldStatus !== 'Aprobado') {
      const formattedDocId = `${item.document_type}-${item.document_id}`;
      let user = await User.findOne({ where: { document_id: formattedDocId } });
      let rawPassword = '';
      let createdNewUser = false;

      if (!user) {
        // Generar un username único (limpiando acentos y caracteres especiales)
        const cleanFirstName = item.first_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const cleanFirstLastname = item.first_lastname.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const baseUsername = `${cleanFirstName}.${cleanFirstLastname}`;
        
        let username = baseUsername;
        let counter = 1;
        let userExists = await User.findOne({ where: { username } });
        while (userExists) {
          username = `${baseUsername}${counter}`;
          userExists = await User.findOne({ where: { username } });
          counter++;
        }

        // Generar contraseña estándar: ApellidoCap*Ultimos4Digitos
        const cleanLastnameCap = item.first_lastname.charAt(0).toUpperCase() + item.first_lastname.slice(1).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, '');
        const docDigits = item.document_id.replace(/\D/g, '');
        const lastFour = docDigits.slice(-4) || '1234';
        rawPassword = `${cleanLastnameCap}*${lastFour}`;

        // Crear cuenta de usuario
        user = await User.create({
          id_role: 3, // Estudiante
          document_id: formattedDocId,
          username,
          password_hash: hashPassword(rawPassword),
          first_name: item.first_name,
          second_name: item.second_name || null,
          first_lastname: item.first_lastname,
          second_lastname: item.second_lastname || null,
          email: item.email,
          phone: item.phone,
          date_birth: item.birth_date,
          status: 'Activo',
          created_at: new Date(),
          updated_at: new Date()
        });

        // Crear registro de estudiante
        await Student.create({
          id_user: user.id_user,
          id_career: item.id_career,
          id_semester: item.id_semester || 1,
          status: 'Regular',
          admission_date: new Date().toISOString().split('T')[0]
        });

        createdNewUser = true;
      }

      if (createdNewUser && item.email) {
        // Enviar correo de aceptación con credenciales
        const subject = 'Pre-registro Aprobado - Portal UPTNT';
        const text = `¡Felicidades, ${item.first_name}! Tu solicitud de pre-registro en la UPTNT ha sido aprobada.\n\n` +
          `Hemos creado tu cuenta de acceso al Portal Académico:\n` +
          `- Correo: ${item.email}\n` +
          `- Contraseña Temporal: ${rawPassword}\n\n` +
          `Por razones de seguridad, te sugerimos ingresar al portal y cambiar esta contraseña estándar a la brevedad.\n\n` +
          `Bienvenido a nuestra comunidad académica.`;
        const html = buildStyledEmail({
          title: '¡Pre-registro Aprobado!',
          subtitle: 'Tu solicitud ha sido verificada y aprobada exitosamente.',
          intro: `${item.first_name} ${item.first_lastname}`,
          body: 'Nos complace informarte que tu solicitud de pre-registro ha sido <strong>verificada y aprobada</strong> por el equipo administrativo de nuestra institución.',
          detailsTitle: 'Tus credenciales de acceso creadas',
          detailsRows: [
            { label: 'Correo', value: `<code style="background:#e0e7ff;padding:2px 8px;border-radius:6px;font-size:13px;">${item.email}</code>` },
            { label: 'Contraseña Temporal', value: `<code style="background:#e0e7ff;padding:2px 8px;border-radius:6px;font-size:13px;">${rawPassword}</code>` },
          ],
          ctaLabel: null,
          ctaUrl: null,
          closing: 'Ya puedes iniciar sesión en el portal para continuar con tus procesos académicos e inscripciones.<br/><br/>Atentamente,<br/><strong style="color:#0f172a;">Departamento de Admisiones UPTNT</strong>',
        });

        try {
          await sendEmail({
            to: item.email,
            subject,
            text,
            html,
            emailType: 'approved',
            emailParams: {
              firstName: item.first_name,
              lastName: item.first_lastname,
              email: item.email,
              password: rawPassword,
            },
          });
        } catch (mailErr) {
          console.error('Error enviando correo de aprobacion a aspirante:', mailErr.message || mailErr);
        }
      }
    }

    if (newStatus === 'Rechazado' && oldStatus !== 'Rechazado' && item.email) {
      const subject = 'Actualización de pre-registro - Portal UPTNT';
      const text = `Estimado(a) ${item.first_name} ${item.first_lastname}:\n\n` +
        `Hemos revisado tu solicitud de pre-registro y, en esta oportunidad, no ha podido ser aprobada.\n\n` +
        `Código de pre-registro: ${item.verification_code || `PR-${String(item.id_pre).padStart(6, '0')}`}\n` +
        `Estado actual: Rechazado\n\n` +
        `Te invitamos a verificar los datos suministrados y, si corresponde, realizar un nuevo proceso de postulación en el periodo habilitado.\n\n` +
        `Atentamente,\nDepartamento de Admisiones UPTNT`;

      const html = buildStyledEmail({
        title: 'Actualización de pre-registro',
        subtitle: 'Tu solicitud fue revisada por nuestro equipo administrativo.',
        intro: `${item.first_name} ${item.first_lastname}`,
        body: 'Hemos revisado tu solicitud de pre-registro y, en esta oportunidad, no ha podido ser aprobada.',
        detailsTitle: 'Detalles de la solicitud',
        detailsRows: [
          { label: 'Código de pre-registro', value: item.verification_code || `PR-${String(item.id_pre).padStart(6, '0')}` },
          { label: 'Estado actual', value: 'Rechazado' },
        ],
        ctaLabel: null,
        ctaUrl: null,
        closing: 'Te invitamos a verificar los datos suministrados y, si corresponde, realizar un nuevo proceso de postulación en el periodo habilitado.<br/><br/>Atentamente,<br/><strong style="color:#0f172a;">Departamento de Admisiones UPTNT</strong>',
      });

      try {
        await sendEmail({
          to: item.email,
          subject,
          text,
          html,
          emailType: 'rejected',
          emailParams: {
            firstName: item.first_name,
            lastName: item.first_lastname,
            verificationCode: item.verification_code || `PR-${String(item.id_pre).padStart(6, '0')}`,
          },
        });
      } catch (mailErr) {
        console.error('Error enviando correo de rechazo a aspirante:', mailErr.message || mailErr);
      }
    }

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

    const currentObservations = item.observations ? String(item.observations).trim() : '';
    const softDeleteMarker = '[[SOFT_DELETED]]';
    const nextObservations = currentObservations
      ? `${currentObservations}\n${softDeleteMarker}`
      : softDeleteMarker;

    await item.update({
      status_pre: 'Rechazado',
      observations: nextObservations,
    });

    try {
      await logActivity(req, {
        action: 'DELETE',
        tableAffected: 'Preinscripción',
        recordId: item.id_pre,
        newValue: `Preinscripción eliminada de ${item.first_name} ${item.first_lastname}`
      });
    } catch (logErr) {
      console.error('AuditLog delete error:', logErr);
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};