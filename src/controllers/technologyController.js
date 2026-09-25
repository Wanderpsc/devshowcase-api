const technologyRepository = require('../repositories/technologyRepository');
const { parseTechnologyInput, toTechnologyOutput } = require('../dtos/technologyDto');

async function create(req, res) {
  const technology = await technologyRepository.create(parseTechnologyInput(req.body));
  res.status(201).json(toTechnologyOutput(technology));
}

async function findAll(req, res) {
  const technologies = await technologyRepository.findAll();
  res.json(technologies.map(toTechnologyOutput));
}

module.exports = { create, findAll };