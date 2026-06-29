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

  EMAIL_TRANSPORT: Joi.string().valid('log', 'smtp', 'emailjs', 'dual').default('log'),
  EMAIL_FROM: Joi.string().email().default('no-reply@example.com'),
  ADMIN_NOTIFICATION_EMAILS: Joi.string().allow('').optional(),
  SMTP_HOST: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }),
  SMTP_PORT: Joi.number().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }).default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }),
  SMTP_PASS: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required() }),
  EMAILJS_SERVICE_ID: Joi.string().when('EMAIL_TRANSPORT', { is: 'emailjs', then: Joi.required() }),
  EMAILJS_PUBLIC_KEY: Joi.string().when('EMAIL_TRANSPORT', { is: 'emailjs', then: Joi.required() }),
  EMAILJS_PRIVATE_KEY: Joi.string().when('EMAIL_TRANSPORT', { is: 'emailjs', then: Joi.required() }),
  EMAILJS_TEMPLATE_ID_ADMIN: Joi.string().when('EMAIL_TRANSPORT', { is: 'emailjs', then: Joi.required() }),
  EMAILJS_TEMPLATE_ID_CUENTA: Joi.string().when('EMAIL_TRANSPORT', { is: 'emailjs', then: Joi.required() }),
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  //FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  //WEBSITE_URL: Joi.string().uri().default('http://localhost:5174'),
  FRONTEND_URL: Joi.string().uri().default('https://sgumsfrontend.netlify.app'),
  WEBSITE_URL: Joi.string().uri().default('https://sgumswebsite.netlify.app'),
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
  emailjs: {
    serviceId: envVars.EMAILJS_SERVICE_ID,
    publicKey: envVars.EMAILJS_PUBLIC_KEY,
    privateKey: envVars.EMAILJS_PRIVATE_KEY,
    templateAdmin: envVars.EMAILJS_TEMPLATE_ID_ADMIN,
    templateCuenta: envVars.EMAILJS_TEMPLATE_ID_CUENTA,
  },
  openaiApiKey: envVars.OPENAI_API_KEY,
  frontendUrl: envVars.FRONTEND_URL,
  websiteUrl: envVars.WEBSITE_URL,
  adminNotificationEmails: envVars.ADMIN_NOTIFICATION_EMAILS || '',
};
