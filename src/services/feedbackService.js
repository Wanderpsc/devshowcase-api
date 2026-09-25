const feedbackRepository = require('../repositories/feedbackRepository');
const { parseFeedbackInput, toFeedbackOutput } = require('../dtos/feedbackDto');

async function create(body, projectId) {
  const result = await feedbackRepository.create(parseFeedbackInput(body, projectId));
  return {
    feedback: toFeedbackOutput(result.feedback),
    averageRating: Number(result.averageRating),
  };
}

module.exports = { create };