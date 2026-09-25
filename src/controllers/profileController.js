const profileRepository = require('../repositories/profileRepository');
const { parseProfileInput, toProfileOutput } = require('../dtos/profileDto');
const { validUuid } = require('../dtos/validation');
const AppError = require('../utils/AppError');

async function create(req, res) {
  const profile = await profileRepository.create(parseProfileInput(req.body));
  res.status(201).json(toProfileOutput(profile));
}

async function findById(req, res) {
  const id = validUuid(req.params.id, 'id');
  const profile = await profileRepository.findById(id);
  if (!profile) throw new AppError('Perfil nao encontrado.', 404);
  res.json(toProfileOutput(profile));
}

module.exports = { create, findById };