const config = require('../config/env');
const { signAccessToken, verifyAccessToken } = require('./jwtService');

function buildResetPasswordUrl(token, frontendUrl = config.frontendUrl) {
  const normalizedBaseUrl = String(frontendUrl || '').replace(/\/$/, '');
  return `${normalizedBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

function buildPasswordResetEmailText(name, username, resetUrl) {
  const displayName = name || username || 'usuario';

  return [
    `Hola ${displayName},`,
    '',
    'Recibimos una solicitud para restablecer tu contrasena.',
    'Abre el siguiente enlace para elegir una nueva contrasena:',
    resetUrl,
    '',
    'Este enlace tiene expiracion por seguridad.',
    'Si no solicitaste este cambio, puedes ignorar este correo.',
  ].join('\n');
}

function buildPasswordResetEmailHtml(name, username, resetUrl) {
  const displayName = name || username || 'usuario';
  const preheader = 'Recibimos tu solicitud para restablecer la contrasena. Usa el enlace antes de que expire.';

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
      ${preheader}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0;padding:0;width:100%;background:#f4f7fb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(15,23,42,0.12);font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:32px 40px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.9;margin-bottom:8px;">Recuperacion de contraseña</div>
                <div style="font-size:30px;line-height:1.2;font-weight:700;">Restablece tu acceso</div>
                <div style="font-size:15px;line-height:1.6;margin-top:12px;opacity:0.95;">
                  Hemos preparado un enlace seguro para crear una nueva contraseña.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 24px;color:#0f172a;">
                <div style="font-size:16px;line-height:1.7;margin-bottom:18px;">
                  Hola ${displayName},
                </div>
                <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">
                  Para completar el proceso, abre el siguiente enlace y define tu nueva contraseña.
                </div>
                <div style="background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;padding:18px 20px;text-align:center;margin-bottom:26px;">
                  <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:10px;">Enlace de recuperación</div>
                  <div style="font-size:14px;line-height:1.6;color:#2563eb;word-break:break-word;">
                    ${resetUrl}
                  </div>
                </div>
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 10px 20px rgba(37,99,235,0.18);">
                    Crear nueva contraseña
                  </a>
                </div>
                <div style="font-size:14px;line-height:1.8;color:#475569;background:#f8fafc;border-radius:14px;padding:18px 20px;">
                  Este enlace expira por seguridad.
                  <br>
                  Si no solicitaste este cambio, ignora este mensaje.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
                Este es un mensaje automatico. No respondas este correo.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function createPasswordResetToken(user, expiresIn = config.passwordResetTokenExpiresIn) {
  return signAccessToken(
    {
      sub: user.id_user,
      email: user.email,
      purpose: 'password-reset',
    },
    { expiresIn }
  );
}

function verifyPasswordResetToken(token) {
  const payload = verifyAccessToken(token);

  if (payload?.purpose !== 'password-reset') {
    const error = new Error('Token de recuperacion invalido');
    error.status = 401;
    throw error;
  }

  return payload;
}

async function requestPasswordReset({
  user,
  sendEmail,
  frontendUrl = config.frontendUrl,
  tokenExpiresIn = config.passwordResetTokenExpiresIn,
}) {
  const token = createPasswordResetToken(user, tokenExpiresIn);
  const resetUrl = buildResetPasswordUrl(token, frontendUrl);

  await sendEmail({
    to: user.email,
    subject: 'Recuperacion de contrasena',
    text: buildPasswordResetEmailText(user.name, user.username, resetUrl),
    html: buildPasswordResetEmailHtml(user.name, user.username, resetUrl),
  });

  return {
    token,
    resetUrl,
  };
}

async function completePasswordReset({
  token,
  newPassword,
  findUserById,
  hashPassword,
}) {
  const payload = verifyPasswordResetToken(token);
  const user = await findUserById(payload.sub);

  if (!user) {
    return {
      status: 404,
      body: { message: 'Usuario no encontrado' },
    };
  }

  if (user.email !== payload.email) {
    const error = new Error('El token de recuperacion no coincide con el usuario');
    error.status = 400;
    throw error;
  }

  await user.update({
    password_hash: hashPassword(newPassword),
  });

  return {
    status: 200,
    body: { message: 'Contrasena actualizada con exito' },
  };
}

module.exports = {
  buildPasswordResetEmailHtml,
  buildPasswordResetEmailText,
  buildResetPasswordUrl,
  completePasswordReset,
  createPasswordResetToken,
  requestPasswordReset,
  verifyPasswordResetToken,
};
