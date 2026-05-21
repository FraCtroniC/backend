const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { json, urlencoded } = require('express');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const { sequelize } = require('./config/database');

const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(json({ limit: '1mb', strict: true }));
app.use(urlencoded({ extended: true }));

app.use('/api', routes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
