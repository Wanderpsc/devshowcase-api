const AppError = require('../utils/AppError');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota nao encontrada.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ja existe um registro com esses dados.' });
  }

  if (error.code === '23503') {
    return res.status(422).json({ error: 'O registro relacionado nao existe.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { errorHandler, notFoundHandler };