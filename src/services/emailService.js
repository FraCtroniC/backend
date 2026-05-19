const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter;

function getTransporter() {
  if (config.email.transport === 'log') {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    text,
    html,
  };

  if (config.email.transport === 'log') {
    console.log('[email:log] Simulando envio de correo', {
      to,
      subject,
      text,
    });
    return true;
  }

  const mailer = getTransporter();
  await mailer.sendMail(mailOptions);
  return true;
}

module.exports = { sendEmail };
