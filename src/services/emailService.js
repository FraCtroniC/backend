// Placeholder service for external integrations (e.g., email providers)
async function sendEmail({ to, subject, text, html }) {
  // Integrate with SendGrid / Mailgun / SES here
  console.log(`Sending email to ${to} — subject: ${subject}`);
  return true;
}

module.exports = { sendEmail };
