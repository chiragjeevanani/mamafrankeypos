const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log 500 server errors as error, and client errors (400s) as warn
  if (statusCode === 500) {
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`, err);
  } else {
    logger.warn(`${err.message} - Status: ${statusCode} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  }

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
