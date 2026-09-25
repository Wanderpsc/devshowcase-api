const projectRepository = require('../repositories/projectRepository');
const { parseProjectInput, toProjectOutput } = require('../dtos/projectDto');
const projectService = require('../services/projectService');

async function create(req, res) {
  const project = await projectRepository.create(parseProjectInput(req.body));
  res.status(201).json(toProjectOutput(project));
}

async function findAll(req, res) {
  res.json(await projectService.findAll(req.query));
}

async function upvote(req, res) {
  res.json(await projectService.upvote(req.params.projectId));
}

module.exports = { create, findAll, upvote };