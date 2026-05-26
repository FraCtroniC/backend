const test = require('node:test');
const assert = require('node:assert/strict');

const {
  generateTemporaryPassword,
  recoverPassword,
} = require('../src/services/passwordRecoveryService');

test('generateTemporaryPassword returns a password with the expected length', () => {
  const password = generateTemporaryPassword(16);

  assert.equal(password.length, 16);
  assert.match(password, /^[A-Za-z0-9!@#$%]+$/);
});

test('recoverPassword returns 404 when the email does not exist', async () => {
  const result = await recoverPassword({
    email: 'missing@example.com',
    findUserByEmail: async () => null,
    sendEmail: async () => true,
    hashPassword: (value) => `hash:${value}`,
    generatePassword: () => 'Temp1234!',
  });

  assert.equal(result.status, 404);
  assert.deepEqual(result.body, {
    message: 'No existe un usuario registrado con ese correo',
  });
});

test('recoverPassword updates the hash and sends the temporary password', async () => {
  const updates = [];
  let sentMail = null;
  const user = {
    email: 'student@example.com',
    username: 'student',
    name: 'Student',
    password_hash: 'old-hash',
    async update(payload) {
      updates.push(payload);
      this.password_hash = payload.password_hash;
      return this;
    },
  };

  const result = await recoverPassword({
    email: 'student@example.com',
    findUserByEmail: async () => user,
    sendEmail: async (payload) => {
      sentMail = payload;
      return true;
    },
    hashPassword: (value) => `hash:${value}`,
    generatePassword: () => 'Temp1234!',
  });

  assert.equal(result.status, 200);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].password_hash, 'hash:Temp1234!');
  assert.equal(sentMail.to, 'student@example.com');
  assert.match(sentMail.text, /Temp1234!/);
  assert.match(sentMail.html, /display:none;max-height:0;overflow:hidden;opacity:0;color:transparent/);
  assert.match(sentMail.html, /Iniciar sesion/);
  assert.match(sentMail.html, /Temp1234!/);
});

test('recoverPassword rolls back the hash when email sending fails', async () => {
  const updates = [];
  const user = {
    email: 'student@example.com',
    username: 'student',
    name: 'Student',
    password_hash: 'old-hash',
    async update(payload) {
      updates.push(payload);
      this.password_hash = payload.password_hash;
      return this;
    },
  };

  await assert.rejects(
    recoverPassword({
      email: 'student@example.com',
      findUserByEmail: async () => user,
      sendEmail: async () => {
        throw new Error('SMTP failed');
      },
      hashPassword: (value) => `hash:${value}`,
      generatePassword: () => 'Temp1234!',
    }),
    /SMTP failed/
  );

  assert.equal(updates.length, 2);
  assert.equal(updates[0].password_hash, 'hash:Temp1234!');
  assert.equal(updates[1].password_hash, 'old-hash');
});