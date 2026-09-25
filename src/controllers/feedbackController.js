const feedbackRepository = require('../repositories/feedbackRepository');
const { parseFeedbackInput, toFeedbackOutput } = require('../dtos/feedbackDto');
const { validUuid } = require('../dtos/validation');

async function create(req, res) {
  const input = parseFeedbackInput(req.body, req.params.projectId);
  const feedback = await feedbackRepository.create(input);
  res.status(201).json(toFeedbackOutput(feedback));
}

async function findByProjectId(req, res) {
  const projectId = validUuid(req.params.projectId, 'projectId');
  const feedbacks = await feedbackRepository.findByProjectId(projectId);
  res.json(feedbacks.map(toFeedbackOutput));
}

module.exports = { create, findByProjectId };