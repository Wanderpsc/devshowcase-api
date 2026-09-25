const { requiredString, validUuid, validationError } = require('./validation');

function parseFeedbackInput(body = {}, projectId) {
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    validationError([{ field: 'rating', message: 'Informe uma nota inteira entre 1 e 5.' }]);
  }

  return {
    projectId: validUuid(projectId, 'projectId'),
    authorName: requiredString(body.authorName, 'authorName', 120),
    comment: requiredString(body.comment, 'comment', 2000),
    rating: body.rating,
  };
}

function toFeedbackOutput(feedback) {
  return {
    id: feedback.id,
    projectId: feedback.projectId,
    authorName: feedback.authorName,
    comment: feedback.comment,
    rating: feedback.rating,
    createdAt: feedback.createdAt,
  };
}

module.exports = { parseFeedbackInput, toFeedbackOutput };