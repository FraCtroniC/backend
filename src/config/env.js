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
};
