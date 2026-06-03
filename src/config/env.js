const Joi = require('joi');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DB_ENV: Joi.string().valid('local', 'remote').default('local'),

  DB_HOST_LOCAL: Joi.string().when('DB_ENV', { is: 'local', then: Joi.required() }),
  DB_PORT_LOCAL: Joi.number().when('DB_ENV', { is: 'local', then: Joi.required() }).default(5432),
  DB_NAME_LOCAL: Joi.string().when('DB_ENV', { is: 'local', then: Joi.required() }),
  DB_USER_LOCAL: Joi.string().when('DB_ENV', { is: 'local', then: Joi.required() }),
  DB_PASS_LOCAL: Joi.string().when('DB_ENV', { is: 'local', then: Joi.required() }),

  DB_URI_REMOTE: Joi.string().when('DB_ENV', { is: 'remote', then: Joi.required() }),

  JWT_SECRET: Joi.string().default('change_me'),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: Joi.string().default('30m'),

  EMAIL_TRANSPORT: Joi.string().valid('log', 'smtp').default('log'),
  EMAIL_FROM: Joi.string().email().default('no-reply@example.com'),
  ADMIN_NOTIFICATION_EMAILS: Joi.string().allow('').optional(),
  SMTP_HOST: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }),
  SMTP_PORT: Joi.number().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }).default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }),
  SMTP_PASS: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
}).unknown();

const { value: envVars, error } = schema.validate(process.env);

if (error) {
  console.error('❌ Invalid environment variables:', error.message);
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  dbEnv: envVars.DB_ENV,
  db: {
    local: {
      host: envVars.DB_HOST_LOCAL,
      port: envVars.DB_PORT_LOCAL,
      database: envVars.DB_NAME_LOCAL,
      username: envVars.DB_USER_LOCAL,
      password: envVars.DB_PASS_LOCAL,
    },
    remoteUri: envVars.DB_URI_REMOTE,
  },
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiresIn: envVars.JWT_EXPIRES_IN,
  passwordResetTokenExpiresIn: envVars.PASSWORD_RESET_TOKEN_EXPIRES_IN,
  email: {
    transport: envVars.EMAIL_TRANSPORT,
    from: envVars.EMAIL_FROM,
    smtpHost: envVars.SMTP_HOST,
    smtpPort: envVars.SMTP_PORT,
    smtpSecure: envVars.SMTP_SECURE,
    smtpUser: envVars.SMTP_USER,
    smtpPass: envVars.SMTP_PASS,
  },
  frontendUrl: envVars.FRONTEND_URL,
  adminNotificationEmails: envVars.ADMIN_NOTIFICATION_EMAILS || '',
};
