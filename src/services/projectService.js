const projectRepository = require('../repositories/projectRepository');
const { toProjectOutput } = require('../dtos/projectDto');
const { validUuid, validationError } = require('../dtos/validation');
const AppError = require('../utils/AppError');

function positiveInteger(value, field, defaultValue, maximum) {
  if (value === undefined) return defaultValue;
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > maximum) {
    validationError([{ field, message: `Informe um inteiro entre 1 e ${maximum}.` }]);
  }
  return Number(value);
}

async function findAll(query) {
  const page = positiveInteger(query.page, 'page', 1, 1000000);
  const limit = positiveInteger(query.limit, 'limit', 10, 100);
  const technology = typeof query.technology === 'string' && query.technology.trim()
    ? query.technology.trim()
    : null;
  const { projects, total } = await projectRepository.findAll({ technology, page, limit });

  return {
    data: projects.map(toProjectOutput),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function upvote(projectId) {
  const project = await projectRepository.upvote(validUuid(projectId, 'projectId'));
  if (!project) throw new AppError('Projeto nao encontrado.', 404);
  return project;
}

module.exports = { findAll, upvote };