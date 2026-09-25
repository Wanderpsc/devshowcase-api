const AppError = require('../utils/AppError');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validationError(details) {
  throw new AppError('Dados de entrada invalidos.', 422, details);
}

function requiredString(value, field, maxLength) {
  if (typeof value !== 'string' || value.trim() === '') {
    validationError([{ field, message: 'Campo obrigatorio.' }]);
  }

  const normalized = value.trim();
  if (maxLength && normalized.length > maxLength) {
    validationError([{ field, message: `Deve ter no maximo ${maxLength} caracteres.` }]);
  }
  return normalized;
}

function optionalString(value, field, maxLength) {
  if (value === undefined || value === null || value === '') return null;
  return requiredString(value, field, maxLength);
}

function validUrl(value, field, required = true) {
  const normalized = required
    ? requiredString(value, field)
    : optionalString(value, field);
  if (normalized === null) return null;

  try {
    const url = new URL(normalized);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    validationError([{ field, message: 'Informe uma URL HTTP ou HTTPS valida.' }]);
  }
}

function validUuid(value, field) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    validationError([{ field, message: 'Informe um UUID valido.' }]);
  }
  return value;
}

module.exports = {
  EMAIL_PATTERN,
  optionalString,
  requiredString,
  validUrl,
  validUuid,
  validationError,
};