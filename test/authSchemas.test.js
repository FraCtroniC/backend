const test = require('node:test');
const assert = require('node:assert/strict');

const { changePasswordSchema } = require('../src/validators/domainSchemas');

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