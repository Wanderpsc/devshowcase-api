const { requiredString } = require('./validation');

function parseTechnologyInput(body = {}) {
  return { name: requiredString(body.name, 'name', 80) };
}

function toTechnologyOutput(technology) {
  return {
    id: technology.id,
    name: technology.name,
    createdAt: technology.createdAt,
  };
}

module.exports = { parseTechnologyInput, toTechnologyOutput };