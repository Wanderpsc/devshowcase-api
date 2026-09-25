const feedbackRepository = require('../repositories/feedbackRepository');
const feedbackService = require('../services/feedbackService');
const { toFeedbackOutput } = require('../dtos/feedbackDto');
const { validUuid } = require('../dtos/validation');

async function create(req, res) {
  const result = await feedbackService.create(req.body, req.params.projectId);
  res.status(201).json(result);
}

async function findByProjectId(req, res) {
  const projectId = validUuid(req.params.projectId, 'projectId');
  const feedbacks = await feedbackRepository.findByProjectId(projectId);
  res.json(feedbacks.map(toFeedbackOutput));
}

module.exports = { create, findByProjectId };