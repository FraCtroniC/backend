const crypto = require('crypto');

function buildRecoveryEmailText(name, username, temporaryPassword, loginUrl) {
  const displayName = name || username || 'usuario';

  return [
    `Hola ${displayName},`,
    '',
    'Hemos generado una nueva contraseña temporal para tu cuenta.',
    `Contraseña temporal: ${temporaryPassword}`,
    '',
    `Ingresa aqui: ${loginUrl}`,
    '',
    'Por seguridad, cambia esta contraseña apenas inicies sesion.',
    'Si no solicitaste este cambio, puedes ignorar este correo.',
  ].join('\n');
}

function buildRecoveryEmailHtml(name, username, temporaryPassword, loginUrl) {
  const displayName = name || username || 'usuario';
  const preheader = 'Tu nueva contraseña temporal ya esta lista. Inicia sesion y cambiala cuanto antes.';

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
                <div style="font-size:30px;line-height:1.2;font-weight:700;">Tu acceso fue restablecido</div>
                <div style="font-size:15px;line-height:1.6;margin-top:12px;opacity:0.95;">
                  Hemos generado una nueva contraseña temporal para tu cuenta.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 24px;color:#0f172a;">
                <div style="font-size:16px;line-height:1.7;margin-bottom:18px;">
                  Hola ${displayName},
                </div>
                <div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:22px;">
                  Usa la siguiente contraseña temporal para volver a ingresar a tu cuenta.
                </div>
                <div style="background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;padding:18px 20px;text-align:center;margin-bottom:26px;">
                  <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:10px;">Contraseña temporal</div>
                  <div style="font-size:28px;line-height:1.2;font-weight:700;color:#2563eb;word-break:break-word;letter-spacing:0.6px;">${temporaryPassword}</div>
                </div>
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 10px 20px rgba(37,99,235,0.18);">
                    Iniciar sesion
                  </a>
                </div>
                <div style="font-size:14px;line-height:1.8;color:#475569;background:#f8fafc;border-radius:14px;padding:18px 20px;">
                  Por seguridad, cambia esta contraseña apenas entres.
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

function generateTemporaryPassword(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(length);
  let password = '';

  for (let index = 0; index < length; index += 1) {
    password += alphabet[bytes[index] % alphabet.length];
  }

  return password;
}

async function recoverPassword({
  email,
  findUserByEmail,
  sendEmail,
  hashPassword,
  generatePassword = generateTemporaryPassword,
  loginUrl = 'http://localhost:5173/login',
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      status: 404,
      body: { message: 'No existe un usuario registrado con ese correo' },
    };
  }

  const temporaryPassword = generatePassword();
  const previousPasswordHash = user.password_hash;

  await user.update({
    password_hash: hashPassword(temporaryPassword),
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Recuperacion de contrasena',
      text: buildRecoveryEmailText(user.name, user.username, temporaryPassword, loginUrl),
      html: buildRecoveryEmailHtml(user.name, user.username, temporaryPassword, loginUrl),
    });
  } catch (error) {
    await user.update({ password_hash: previousPasswordHash });
    throw error;
  }

  return {
    status: 200,
    body: { message: 'Se envio una nueva contrasena temporal al correo indicado' },
  };
}

module.exports = {
  generateTemporaryPassword,
  recoverPassword,
  buildRecoveryEmailHtml,
  buildRecoveryEmailText,
};