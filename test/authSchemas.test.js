const test = require('node:test');
const assert = require('node:assert/strict');

const { changePasswordSchema, profileUpdateSchema } = require('../src/validators/domainSchemas');

test('changePasswordSchema requires confirmPassword and matches newPassword', () => {
  const validResult = changePasswordSchema.safeParse({
    currentPassword: 'Current123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  });

  assert.equal(validResult.success, true);

  const missingConfirmResult = changePasswordSchema.safeParse({
    currentPassword: 'Current123!',
    newPassword: 'NewPassword123!',
  });

  assert.equal(missingConfirmResult.success, false);

  const mismatchResult = changePasswordSchema.safeParse({
    currentPassword: 'Current123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'Different123!',
  });

  assert.equal(mismatchResult.success, false);
  assert.equal(mismatchResult.error.issues[0].path[0], 'confirmPassword');
});

test('profileUpdateSchema allows only editable profile fields and requires at least one', () => {
  const validResult = profileUpdateSchema.safeParse({
    email: 'usuario@correo.com',
    name: 'Nombre',
  });

  assert.equal(validResult.success, true);

  const emptyResult = profileUpdateSchema.safeParse({});
  assert.equal(emptyResult.success, false);

  const forbiddenFieldResult = profileUpdateSchema.safeParse({
    id_role: 2,
  });

  assert.equal(forbiddenFieldResult.success, false);
});