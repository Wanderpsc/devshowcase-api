const projectRepository = require('../repositories/projectRepository');
const { parseProjectInput, toProjectOutput } = require('../dtos/projectDto');

async function create(req, res) {
  const project = await projectRepository.create(parseProjectInput(req.body));
  res.status(201).json(toProjectOutput(project));
}

async function findAll(req, res) {
  const projects = await projectRepository.findAll();
  res.json(projects.map(toProjectOutput));
}

module.exports = { create, findAll };