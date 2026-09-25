const {
  EMAIL_PATTERN,
  optionalString,
  requiredString,
  validUrl,
  validationError,
} = require('./validation');

function parseProfileInput(body = {}) {
  const email = requiredString(body.email, 'email', 255).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    validationError([{ field: 'email', message: 'Informe um e-mail valido.' }]);
  }

  return {
    name: requiredString(body.name, 'name', 120),
    email,
    bio: optionalString(body.bio, 'bio', 2000),
    githubUrl: validUrl(body.githubUrl, 'githubUrl'),
  };
}

function toProfileOutput(profile) {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    githubUrl: profile.githubUrl,
    projects: profile.projects || [],
    createdAt: profile.createdAt,
  };
}

module.exports = { parseProfileInput, toProfileOutput };