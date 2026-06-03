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
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #051124; padding: 24px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; color: #ffd100;">¡Pre-registro Aprobado!</h2>
              <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #cbd5e1;">Portal Académico UPTNT</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; line-height: 1.6;">
              <p>Estimado(a) <strong>${item.first_name} ${item.first_lastname}</strong>,</p>
              <p>Nos complace informarte que tu solicitud de pre-registro ha sido <strong>verificada y aprobada</strong> por el equipo administrativo de nuestra institución.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #051124;">Tus credenciales de acceso creadas:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 40%;"><strong>Usuario:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a;"><code>${user.username}</code></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 40%;"><strong>Contraseña Temporal:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a;"><code>${rawPassword}</code></td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff9db; border-left: 4px solid #f5c400; padding: 12px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 0.9rem; color: #664d03;">
                  <strong>Aviso de seguridad:</strong> Se te ha asignado una contraseña temporal generada a partir de tus datos de registro. Para garantizar la confidencialidad de tu cuenta, por favor ingresa al portal académico y realiza el <strong>cambio de contraseña</strong> lo antes posible desde el módulo de tu perfil.
                </p>
              </div>

              <p>Ya puedes iniciar sesión en el portal para continuar con tus procesos académicos e inscripciones.</p>
              <p style="margin-top: 24px;">Atentamente,<br/><strong>Departamento de Admisiones UPTNT</strong></p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0;">
              Este es un correo electrónico generado automáticamente. Por favor no respondas a esta dirección.
            </div>
          </div>
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