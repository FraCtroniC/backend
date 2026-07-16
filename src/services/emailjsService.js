/**
 * emailjsService.js
 *
 * Construye los templateParams para cada tipo de correo usando las
 * 2 plantillas disponibles en la cuenta gratuita de EmailJS:
 *
 *   - templateAdmin  : notificación de nuevo pre-registro → administradores
 *   - templateCuenta : aprobado / rechazado / reset password → aspirante o usuario
 *
 * Variables esperadas en EmailJS — Plantilla Admin (template_admin):
 *   {{to_email}}, {{from_name}}, {{aspirant_name}}, {{document}},
 *   {{verification_code}}, {{review_url}}
 *
 * Variables esperadas en EmailJS — Plantilla Cuenta (template_cuenta):
 *   {{to_email}}, {{from_name}}, {{reply_to}}, {{subject_text}},
 *   {{greeting}}, {{main_message}},
 *   {{detail_label_1}}, {{detail_value_1}},
 *   {{detail_label_2}}, {{detail_value_2}},
 *   {{cta_label}}, {{cta_url}}, {{closing}}
 */

const emailjs = require('@emailjs/nodejs');
const config = require('../config/env');

/** Inicializa emailjs una sola vez */
function getEmailJS() {
  emailjs.init({
    publicKey: config.emailjs.publicKey,
    privateKey: config.emailjs.privateKey,
  });
  return emailjs;
}

/**
 * Envía un correo a través de EmailJS.
 * @param {string} templateId - ID de la plantilla en EmailJS
 * @param {object} templateParams - Variables de la plantilla
 */
async function sendViaEmailJS(templateId, templateParams) {
  const client = getEmailJS();
  const response = await client.send(
    config.emailjs.serviceId,
    templateId,
    templateParams
  );
  return response;
}

// ---------------------------------------------------------------------------
// Builders de parámetros — Plantilla Admin
// ---------------------------------------------------------------------------

/**
 * Notificación a administradores: nuevo pre-registro pendiente.
 * @param {object} p
 * @param {string} p.toEmail       - Correo(s) del/los administradores (separados por coma si son varios)
 * @param {string} p.aspirantName  - Nombre completo del aspirante
 * @param {string} p.document      - Tipo y número de documento (ej: "V-12345678")
 * @param {string} p.verificationCode - Código de pre-registro (ej: "PR-AB12CD34")
 * @param {string} p.reviewUrl     - URL al panel de admin para revisar el pre-registro
 */
function buildAdminNotifParams({ toEmail, aspirantName, document, verificationCode, reviewUrl }) {
  return {
    to_email: toEmail,
    name: 'Portal Académico UPTNT',
    from_name: 'Portal Académico UPTNT',
    email: 'no-reply@uptnt.edu.ve',
    reply_to: 'no-reply@uptnt.edu.ve',
    aspirant_name: aspirantName || 'N/D',
    document: document || 'N/D',
    verification_code: verificationCode || 'N/D',
    review_url: reviewUrl || '#',
  };
}

// ---------------------------------------------------------------------------
// Builders de parámetros — Plantilla Cuenta
// ---------------------------------------------------------------------------

/**
 * Correo de pre-registro APROBADO con credenciales de acceso.
 * @param {object} p
 * @param {string} p.toEmail    - Correo del aspirante
 * @param {string} p.firstName  - Primer nombre
 * @param {string} p.lastName   - Primer apellido
 * @param {string} p.email      - Correo electrónico (credencial de login)
 * @param {string} p.password   - Contraseña temporal generada
 */
function buildApprovedParams({ toEmail, firstName, lastName, email, password }) {
  const fullName = `${firstName} ${lastName}`.trim();
  return {
    to_email: toEmail,
    name: 'Portal Académico UPTNT',
    from_name: 'Portal Académico UPTNT',
    email: 'no-reply@uptnt.edu.ve',
    reply_to: 'no-reply@uptnt.edu.ve',
    subject_text: 'Pre-registro Aprobado — Portal UPTNT',
    greeting: `Estimado(a) ${fullName},`,
    main_message:
      '¡Felicitaciones! Tu solicitud de pre-registro ha sido verificada y aprobada por el equipo administrativo de la UPTNT. A continuación encontrarás tus credenciales de acceso al Portal Académico.',
    detail_label_1: 'Correo',
    detail_value_1: email,
    detail_label_2: 'Contraseña Temporal',
    detail_value_2: password,
    cta_label: 'Iniciar sesión en el Portal',
    cta_url: `${config.frontendUrl}/login`,
    closing:
      'Por razones de seguridad, te recomendamos cambiar tu contraseña temporal al iniciar sesión por primera vez. Bienvenido(a) a nuestra comunidad académica. Atentamente, Departamento de Admisiones UPTNT',
  };
}

/**
 * Correo de pre-registro RECHAZADO.
 * @param {object} p
 * @param {string} p.toEmail           - Correo del aspirante
 * @param {string} p.firstName         - Primer nombre
 * @param {string} p.lastName          - Primer apellido
 * @param {string} p.verificationCode  - Código de pre-registro
 */
function buildRejectedParams({ toEmail, firstName, lastName, verificationCode }) {
  const fullName = `${firstName} ${lastName}`.trim();
  return {
    to_email: toEmail,
    name: 'Portal Académico UPTNT',
    from_name: 'Portal Académico UPTNT',
    email: 'no-reply@uptnt.edu.ve',
    reply_to: 'no-reply@uptnt.edu.ve',
    subject_text: 'Actualización de pre-registro — Portal UPTNT',
    greeting: `Estimado(a) ${fullName},`,
    main_message:
      'Hemos revisado tu solicitud de pre-registro y, en esta oportunidad, no ha podido ser aprobada. Te invitamos a verificar los datos suministrados y, si corresponde, realizar un nuevo proceso de postulación en el periodo habilitado.',
    detail_label_1: 'Código de pre-registro',
    detail_value_1: verificationCode || 'N/D',
    detail_label_2: 'Estado actual',
    detail_value_2: 'Rechazado',
    cta_label: 'Volver al sitio web',
    cta_url: config.websiteUrl,
    closing:
      'Si tienes alguna duda, comunícate con la oficina de admisiones. Atentamente, Departamento de Admisiones UPTNT',
  };
}

/**
 * Correo de bienvenida con credenciales (creación manual de usuario por admin).
 * @param {object} p
 * @param {string} p.toEmail    - Correo del usuario
 * @param {string} p.firstName  - Primer nombre
 * @param {string} p.lastName   - Primer apellido
 * @param {string} p.email      - Correo (credencial de login)
 * @param {string} p.password   - Contraseña temporal
 */
function buildWelcomeParams({ toEmail, firstName, lastName, email, password }) {
  const fullName = `${firstName} ${lastName}`.trim();
  return {
    to_email: toEmail,
    name: 'Portal Académico UPTNT',
    from_name: 'Portal Académico UPTNT',
    email: 'no-reply@uptnt.edu.ve',
    reply_to: 'no-reply@uptnt.edu.ve',
    subject_text: 'Bienvenido — Credenciales SGUMS',
    greeting: `Hola ${fullName || 'usuario'},`,
    main_message:
      'Tu cuenta ha sido creada en el sistema SGUMS. A continuación encontrarás tus credenciales de acceso.',
    detail_label_1: 'Correo',
    detail_value_1: email,
    detail_label_2: 'Contraseña Temporal',
    detail_value_2: password,
    cta_label: 'Iniciar sesión en el Portal',
    cta_url: `${config.frontendUrl}/login`,
    closing:
      'Por seguridad, cambia tu contraseña al iniciar sesión. Atentamente, SGUMS - UPTNT Manuela Sáenz',
  };
}

/**
 * Correo de recuperación de contraseña (reset password).
 * @param {object} p
 * @param {string} p.toEmail      - Correo del usuario
 * @param {string} p.displayName  - Nombre a mostrar (nombre o username)
 * @param {string} p.resetUrl     - URL del enlace de reset
 */
function buildResetPasswordParams({ toEmail, displayName, resetUrl }) {
  return {
    to_email: toEmail,
    name: 'Portal Académico UPTNT',
    from_name: 'Portal Académico UPTNT',
    email: 'no-reply@uptnt.edu.ve',
    reply_to: 'no-reply@uptnt.edu.ve',
    subject_text: 'Recuperación de contraseña — Portal UPTNT',
    greeting: `Hola ${displayName || 'usuario'},`,
    main_message:
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón a continuación para crear una nueva contraseña. Este enlace tiene expiración por seguridad.',
    detail_label_1: 'Enlace de recuperación',
    detail_value_1: resetUrl,
    detail_label_2: '',
    detail_value_2: '',
    cta_label: 'Crear nueva contraseña',
    cta_url: resetUrl,
    closing:
      'Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura. Atentamente, Portal Académico UPTNT',
  };
}

module.exports = {
  sendViaEmailJS,
  buildAdminNotifParams,
  buildApprovedParams,
  buildRejectedParams,
  buildResetPasswordParams,
  buildWelcomeParams,
};
