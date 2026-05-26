const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildPasswordResetEmailHtml,
  buildPasswordResetEmailText,
  buildResetPasswordUrl,
  completePasswordReset,
  createPasswordResetToken,
  requestPasswordReset,
  verifyPasswordResetToken,
} = require('../src/services/passwordRecoveryService');

const user = {
  id_user: '78fea3ac-d1da-4133-b799-05d0b9cb76d9',
  email: 'student@example.com',
  username: 'student',
  name: 'Student',
  password_hash: 'old-hash',
  async update(payload) {
    this.password_hash = payload.password_hash;
    this.lastUpdate = payload;
    return this;
  },
};

test('buildResetPasswordUrl points to the frontend reset route', () => {
  const url = buildResetPasswordUrl('abc123', 'http://localhost:5173');

  assert.equal(url, 'http://localhost:5173/reset-password?token=abc123');
});

test('buildPasswordResetEmailText includes the reset link', () => {
  const text = buildPasswordResetEmailText('Student', 'student', 'http://localhost:5173/reset-password?token=abc123');

  assert.match(text, /Recibimos una solicitud para restablecer tu contrasena/);
  assert.match(text, /reset-password\?token=abc123/);
});

test('buildPasswordResetEmailHtml includes preheader and CTA', () => {
  const html = buildPasswordResetEmailHtml('Student', 'student', 'http://localhost:5173/reset-password?token=abc123');

  assert.match(html, /display:none;max-height:0;overflow:hidden;opacity:0;color:transparent/);
  assert.match(html, /Crear nueva contraseña/);
  assert.match(html, /reset-password\?token=abc123/);
});

test('createPasswordResetToken and verifyPasswordResetToken round trip', () => {
  const token = createPasswordResetToken(user, '30m');
  const payload = verifyPasswordResetToken(token);

  assert.equal(payload.sub, user.id_user);
  assert.equal(payload.email, user.email);
  assert.equal(payload.purpose, 'password-reset');
});

test('requestPasswordReset sends a reset link email', async () => {
  let sentMail = null;

  const result = await requestPasswordReset({
    user,
    sendEmail: async (payload) => {
      sentMail = payload;
      return true;
    },
    frontendUrl: 'http://localhost:5173',
    tokenExpiresIn: '30m',
  });

  assert.equal(result.resetUrl.startsWith('http://localhost:5173/reset-password?token='), true);
  assert.equal(sentMail.to, 'student@example.com');
  assert.equal(sentMail.subject, 'Recuperacion de contrasena');
  assert.match(sentMail.text, /reset-password\?token=/);
  assert.match(sentMail.html, /Crear nueva contraseña/);
});

test('completePasswordReset updates the password when token is valid', async () => {
  const token = createPasswordResetToken(user, '30m');
  const result = await completePasswordReset({
    token,
    newPassword: 'NewPass123!',
    findUserById: async () => user,
    hashPassword: (value) => `hash:${value}`,
  });

  assert.equal(result.status, 200);
  assert.equal(user.password_hash, 'hash:NewPass123!');
  assert.equal(user.lastUpdate.password_hash, 'hash:NewPass123!');
});

test('completePasswordReset rejects when token user email does not match', async () => {
  const token = createPasswordResetToken(user, '30m');
  await assert.rejects(
    completePasswordReset({
      token,
      newPassword: 'NewPass123!',
      findUserById: async () => ({
        ...user,
        email: 'different@example.com',
        async update() {
          return this;
        },
      }),
      hashPassword: (value) => `hash:${value}`,
    }),
    /no coincide con el usuario/
  );
});
