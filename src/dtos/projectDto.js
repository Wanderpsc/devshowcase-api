const {
  requiredString,
  validUrl,
  validUuid,
  validationError,
} = require('./validation');

function parseProjectInput(body = {}) {
  if (!Array.isArray(body.technologyIds)) {
    validationError([{ field: 'technologyIds', message: 'Informe uma lista de UUIDs.' }]);
  }

  return {
    profileId: validUuid(body.profileId, 'profileId'),
    title: requiredString(body.title, 'title', 160),
    description: requiredString(body.description, 'description', 5000),
    repositoryUrl: validUrl(body.repositoryUrl, 'repositoryUrl'),
    demoUrl: validUrl(body.demoUrl, 'demoUrl', false),
    technologyIds: [...new Set(body.technologyIds.map((id) => validUuid(id, 'technologyIds')))],
  };
}

function toProjectOutput(project) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    profile: project.profile,
    technologies: project.technologies || [],
    feedbacks: project.feedbacks || [],
    createdAt: project.createdAt,
  };
}

module.exports = { parseProjectInput, toProjectOutput };