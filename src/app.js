const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const { generalLimiter } = require('./middlewares/rateLimiter.middleware');
const ApiError = require('./utils/apiError');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}


app.use('/api', generalLimiter);
app.use('/api/v1', routes);


app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
