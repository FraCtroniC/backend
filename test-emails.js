/**
 * test-emails.js
 * Script para probar el envío de los 4 tipos de correo con EmailJS.
 * Ejecutar desde la raíz del backend:
 *   node test-emails.js
 */

const { sendEmail } = require('./src/services/emailService');

const TEST_EMAIL = 'fabiandelgado5b@gmail.com'; // ← correo donde recibirás las pruebas

async function runTests() {
  console.log('🚀 Iniciando prueba de envío de correos con EmailJS...\n');

  // -----------------------------------------------------------------------
  // 1. Correo de Admin — Nuevo pre-registro pendiente
  // -----------------------------------------------------------------------
  console.log('📧 [1/4] Enviando correo de ADMIN NOTIF...');
  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: 'TEST — Nuevo pre-registro pendiente (PR-TEST01)',
      emailType: 'admin_notif',
      emailParams: {
        aspirantName: 'María Gabriela Rodríguez Pérez',
        document: 'V-28456789',
        verificationCode: 'PR-TEST01',
        reviewUrl: 'http://localhost:5173/admin/pre-registrations/1',
      },
    });
    console.log('   ✅ Admin notif enviado correctamente\n');
  } catch (err) {
    console.error('   ❌ Error en admin_notif:', err.text || err.message || err);
  }

  // Pequeña pausa para no saturar la API de EmailJS
  await sleep(1500);

  // -----------------------------------------------------------------------
  // 2. Correo de APROBADO — Pre-registro aprobado con credenciales
  // -----------------------------------------------------------------------
  console.log('📧 [2/4] Enviando correo de APROBADO...');
  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: 'TEST — Pre-registro Aprobado',
      emailType: 'approved',
      emailParams: {
        firstName: 'María',
        lastName: 'Rodríguez',
        username: 'maria.rodriguez',
        password: 'Rodriguez*6789',
      },
    });
    console.log('   ✅ Aprobado enviado correctamente\n');
  } catch (err) {
    console.error('   ❌ Error en approved:', err.text || err.message || err);
  }

  await sleep(1500);

  // -----------------------------------------------------------------------
  // 3. Correo de RECHAZADO — Pre-registro rechazado
  // -----------------------------------------------------------------------
  console.log('📧 [3/4] Enviando correo de RECHAZADO...');
  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: 'TEST — Actualización de pre-registro',
      emailType: 'rejected',
      emailParams: {
        firstName: 'Carlos',
        lastName: 'Mendoza',
        verificationCode: 'PR-TEST02',
      },
    });
    console.log('   ✅ Rechazado enviado correctamente\n');
  } catch (err) {
    console.error('   ❌ Error en rejected:', err.text || err.message || err);
  }

  await sleep(1500);

  // -----------------------------------------------------------------------
  // 4. Correo de RESET PASSWORD — Recuperación de contraseña
  // -----------------------------------------------------------------------
  console.log('📧 [4/4] Enviando correo de RESET PASSWORD...');
  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: 'TEST — Recuperación de contraseña',
      emailType: 'reset_password',
      emailParams: {
        displayName: 'Carlos Mendoza',
        resetUrl: 'http://localhost:5173/reset-password?token=TEST_TOKEN_EJEMPLO_12345',
      },
    });
    console.log('   ✅ Reset password enviado correctamente\n');
  } catch (err) {
    console.error('   ❌ Error en reset_password:', err.text || err.message || err);
  }

  console.log('🏁 Prueba finalizada. Revisa tu bandeja de entrada en:', TEST_EMAIL);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runTests().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
