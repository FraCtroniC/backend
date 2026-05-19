const crypto = require('crypto');

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
      text: `Hola ${user.name || user.username},\n\nTu nueva contrasena temporal es: ${temporaryPassword}\n\nPor seguridad, te recomendamos cambiarla despues de iniciar sesion.`,
      html: `<p>Hola ${user.name || user.username},</p><p>Tu nueva contrasena temporal es:</p><p><strong>${temporaryPassword}</strong></p><p>Por seguridad, te recomendamos cambiarla despues de iniciar sesion.</p>`,
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
};