const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Backend API',
      version: '1.0.0',
      description: 'Documentacion OpenAPI del backend',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor local',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Profile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
              nullable: true,
            },
            lastname: {
              type: 'string',
              nullable: true,
            },
            role: {
              type: 'string',
              nullable: true,
              readOnly: true,
            },
          },
          required: ['id', 'email', 'name', 'lastname', 'role'],
        },
        ProfileUpdate: {
          type: 'object',
          additionalProperties: false,
          properties: {
            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
            },
            name: {
              type: 'string',
              maxLength: 100,
            },
            lastname: {
              type: 'string',
              maxLength: 100,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token Bearer requerido o invalido',
          content: {
            'application/json': {
              examples: {
                missingToken: {
                  summary: 'Sin token',
                  value: {
                    message: 'Token Bearer requerido',
                  },
                },
                invalidToken: {
                  summary: 'Token invalido',
                  value: {
                    message: 'jwt malformed',
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Usuario no encontrado',
          content: {
            'application/json': {
              examples: {
                userNotFound: {
                  summary: 'Usuario inexistente',
                  value: {
                    message: 'Usuario no encontrado',
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Error de validacion del payload',
          content: {
            'application/json': {
              examples: {
                emptyPayload: {
                  summary: 'Payload vacio',
                  value: {
                    message: 'Debe enviar al menos un campo para actualizar',
                  },
                },
                invalidEmail: {
                  summary: 'Correo invalido',
                  value: {
                    message: 'Invalid email',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js').replace(/\\/g, '/')],
});

module.exports = spec;