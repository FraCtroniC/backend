const nodemailer = require('nodemailer');
const config = require('../config/env');
const {
  sendViaEmailJS,
  buildAdminNotifParams,
  buildApprovedParams,
  buildRejectedParams,
  buildResetPasswordParams,
} = require('./emailjsService');

// ---------------------------------------------------------------------------
// SMTP transport (nodemailer)
// ---------------------------------------------------------------------------

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
  }
  return transporter;
}

// ---------------------------------------------------------------------------
// EmailJS routing
// ---------------------------------------------------------------------------

/**
 * Selecciona la plantilla y construye los parámetros según el tipo de correo.
 * @param {string} emailType  - 'admin_notif' | 'approved' | 'rejected' | 'reset_password'
 * @param {object} emailParams - Datos específicos del correo (ver emailjsService.js)
 * @param {string} to         - Destinatario (fallback si emailParams no incluye toEmail)
 */
async function sendViaEmailJSRouted(emailType, emailParams, to) {
  const { templateAdmin, templateCuenta } = config.emailjs;

  let templateId;
  let params;

  switch (emailType) {
    case 'admin_notif':
      templateId = templateAdmin;
      params = buildAdminNotifParams({ toEmail: to, ...emailParams });
      break;

    case 'approved':
      templateId = templateCuenta;
      params = buildApprovedParams({ toEmail: to, ...emailParams });
      break;

    case 'rejected':
      templateId = templateCuenta;
      params = buildRejectedParams({ toEmail: to, ...emailParams });
      break;

    case 'reset_password':
      templateId = templateCuenta;
      params = buildResetPasswordParams({ toEmail: to, ...emailParams });
      break;

    default:
      // Tipo desconocido: registrar advertencia y no enviar
      console.warn(`[emailjs] Tipo de correo desconocido: "${emailType}". No se envió.`);
      return true;
  }

  await sendViaEmailJS(templateId, params);
  return true;
}

// ---------------------------------------------------------------------------
// sendEmail — interfaz unificada (compatible con todo el código existente)
// ---------------------------------------------------------------------------

/**
 * Envía un correo usando el transport configurado en EMAIL_TRANSPORT.
 *
 * @param {object} options
 * @param {string}  options.to          - Destinatario(s)
 * @param {string}  options.subject     - Asunto (usado en modo smtp/log)
 * @param {string}  [options.text]      - Texto plano (usado en modo smtp/log)
 * @param {string}  [options.html]      - HTML (usado en modo smtp/log)
 * @param {string}  [options.emailType] - Tipo de correo para modo emailjs:
 *                                        'admin_notif' | 'approved' | 'rejected' | 'reset_password'
 * @param {object}  [options.emailParams] - Parámetros adicionales para emailjs
 */
async function sendEmail({ to, subject, text, html, emailType, emailParams }) {
  const transport = config.email.transport;

  // --- Modo log (desarrollo sin envío real) ---
  if (transport === 'log') {
    console.log('[email:log] Simulando envio de correo', { to, subject, emailType, text });
    return true;
  }

  // --- Modo emailjs ---
  if (transport === 'emailjs') {
    if (!emailType) {
      console.warn('[emailjs] sendEmail llamado sin emailType. Se omite el envío.');
      return true;
    }
    return sendViaEmailJSRouted(emailType, emailParams || {}, to);
  }

  // --- Modo smtp (nodemailer) ---
  const mailer = getTransporter();
  await mailer.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });
  return true;
}

module.exports = { sendEmail };
