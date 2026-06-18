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
// SMTP transport (nodemailer) — con timeouts para evitar cuelgues en Render
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
      // Timeouts explícitos para evitar cuelgues en entornos cloud (Render, Railway, etc.)
      connectionTimeout: 10000,  // 10 s para conectar
      greetingTimeout: 10000,    // 10 s para handshake SMTP
      socketTimeout: 15000,      // 15 s de inactividad máxima
      pool: false,               // Sin pool en serverless/cloud
    });
  }
  return transporter;
}

/** Fuerza recrear el transporter (útil si la conexión anterior quedó zombie) */
function resetTransporter() {
  transporter = null;
}

// ---------------------------------------------------------------------------
// EmailJS routing
// ---------------------------------------------------------------------------

/**
 * Selecciona la plantilla y construye los parámetros según el tipo de correo.
 * @param {string} emailType   - 'admin_notif' | 'approved' | 'rejected' | 'reset_password'
 * @param {object} emailParams - Datos específicos del correo
 * @param {string} to          - Destinatario
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
      console.warn(`[emailjs] Tipo de correo desconocido: "${emailType}". No se envió.`);
      return true;
  }

  await sendViaEmailJS(templateId, params);
  return true;
}

// ---------------------------------------------------------------------------
// Envío SMTP con HTML completo (para smtp y dual)
// ---------------------------------------------------------------------------

async function sendViaSMTP({ to, subject, text, html }) {
  const mailer = getTransporter();
  try {
    await mailer.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    // Si falla por conexión zombie, recrear transporter y reintentar una vez
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.warn('[smtp] Reconectando transporter y reintentando...');
      resetTransporter();
      const freshMailer = getTransporter();
      await freshMailer.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });
    } else {
      throw err;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// sendEmail — interfaz unificada (compatible con todo el código existente)
// ---------------------------------------------------------------------------

/**
 * Envía un correo usando el transport configurado en EMAIL_TRANSPORT.
 *
 * Modos disponibles:
 *   - 'log'     → solo imprime en consola (tests / desarrollo sin correo real)
 *   - 'smtp'    → nodemailer vía SMTP (cualquier destinatario, sin límites)
 *   - 'emailjs' → EmailJS (limitado a Contacts en plan gratuito)
 *   - 'dual'    → EmailJS para admin_notif + SMTP para los demás (lo mejor de ambos)
 *
 * @param {object} options
 * @param {string}  options.to           - Destinatario(s)
 * @param {string}  options.subject      - Asunto
 * @param {string}  [options.text]       - Texto plano
 * @param {string}  [options.html]       - HTML del correo
 * @param {string}  [options.emailType]  - 'admin_notif' | 'approved' | 'rejected' | 'reset_password'
 * @param {object}  [options.emailParams]- Parámetros para emailjs
 */
async function sendEmail({ to, subject, text, html, emailType, emailParams }) {
  const transport = config.email.transport;

  // --- Modo log ---
  if (transport === 'log') {
    console.log('[email:log] Simulando envio de correo', { to, subject, emailType });
    return true;
  }

  // --- Modo emailjs puro ---
  if (transport === 'emailjs') {
    if (!emailType) {
      console.warn('[emailjs] sendEmail llamado sin emailType. Se omite el envío.');
      return true;
    }
    return sendViaEmailJSRouted(emailType, emailParams || {}, to);
  }

  // --- Modo dual: EmailJS para admin_notif, SMTP para el resto ---
  if (transport === 'dual') {
    if (emailType === 'admin_notif' && config.emailjs?.serviceId) {
      return sendViaEmailJSRouted(emailType, emailParams || {}, to);
    }
    return sendViaSMTP({ to, subject, text, html });
  }

  // --- Modo smtp puro (default) ---
  return sendViaSMTP({ to, subject, text, html });
}

module.exports = { sendEmail };
