const { PreRegistration, User, Role, State, Municipality, Parish, Career, Semester, Student } = require('../models');
const { sendEmail } = require('../services/emailService');
const config = require('../config/env');
const { hashPassword } = require('../services/passwordService');

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
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;">ID</td>
                            <td style="padding:8px 10px;color:#0f172a;">${item.id_pre}</td>
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

    const oldStatus = item.status_pre;
    const newStatus = req.body.status_pre;

    await item.update(req.body);

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
        const text = `¡Felicidades, ${item.first_name}! Tu solicitud de pre-registro en la UPTNT ha sido Aprobada.\n\n` +
          `Hemos creado tu cuenta de acceso al Portal Académico:\n` +
          `- Usuario: ${user.username}\n` +
          `- Contraseña Temporal: ${rawPassword}\n\n` +
          `Por razones de seguridad, te sugerimos ingresar al portal y cambiar esta contraseña estándar a la brevedad.\n\n` +
          `Bienvenido a nuestra comunidad académica.`;

        const html = `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0;padding:0;width:100%;background:#f4f7fb;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(15,23,42,0.12);font-family:Arial,Helvetica,sans-serif;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:32px 40px;color:#ffffff;text-align:center;">
                      <div style="font-size:13px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.9;margin-bottom:8px;">Portal Académico UPTNT</div>
                      <div style="font-size:30px;line-height:1.2;font-weight:700;">¡Pre-registro Aprobado!</div>
                      <div style="font-size:15px;line-height:1.6;margin-top:12px;opacity:0.95;">
                        Tu solicitud ha sido verificada y aprobada exitosamente.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 40px 24px;color:#0f172a;">
                      <div style="font-size:16px;line-height:1.7;margin-bottom:18px;">
                        Estimado(a) <strong>${item.first_name} ${item.first_lastname}</strong>,
                      </div>
                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">
                        Nos complace informarte que tu solicitud de pre-registro ha sido <strong>verificada y aprobada</strong> por el equipo administrativo de nuestra institución.
                      </div>

                      <div style="background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;padding:18px 20px;margin-bottom:26px;">
                        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:12px;">Tus credenciales de acceso creadas:</div>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                          <tr>
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;width:40%;border-bottom:1px solid #e2e8f0;">Usuario:</td>
                            <td style="padding:8px 10px;color:#0f172a;border-bottom:1px solid #e2e8f0;"><code style="background:#e0e7ff;padding:2px 8px;border-radius:6px;font-size:13px;">${user.username}</code></td>
                          </tr>
                          <tr>
                            <td style="padding:8px 10px;color:#64748b;font-weight:700;">Contraseña Temporal:</td>
                            <td style="padding:8px 10px;color:#0f172a;"><code style="background:#e0e7ff;padding:2px 8px;border-radius:6px;font-size:13px;">${rawPassword}</code></td>
                          </tr>
                        </table>
                      </div>

                      <div style="background:#fff9db;border-left:4px solid #f5c400;padding:14px 18px;margin-bottom:26px;border-radius:8px;">
                        <div style="font-size:14px;line-height:1.7;color:#664d03;">
                          <strong>Aviso de seguridad:</strong> Se te ha asignado una contraseña temporal generada a partir de tus datos de registro. Para garantizar la confidencialidad de tu cuenta, por favor ingresa al portal académico y realiza el <strong>cambio de contraseña</strong> lo antes posible desde el módulo de tu perfil.
                        </div>
                      </div>

                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">
                        Ya puedes iniciar sesión en el portal para continuar con tus procesos académicos e inscripciones.
                      </div>
                      <div style="font-size:15px;line-height:1.7;color:#334155;margin-top:24px;">
                        Atentamente,<br/><strong style="color:#0f172a;">Departamento de Admisiones UPTNT</strong>
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

        try {
          await sendEmail({ to: item.email, subject, text, html });
        } catch (mailErr) {
          console.error('Error enviando correo de aprobacion a aspirante:', mailErr.message || mailErr);
        }
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

    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};