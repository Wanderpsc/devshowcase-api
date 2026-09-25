const database = require('../config/database');

async function create(input) {
  const result = await database.query(
    `INSERT INTO feedbacks (project_id, author_name, comment, rating)
     VALUES ($1, $2, $3, $4)
     RETURNING id, project_id AS "projectId", author_name AS "authorName",
       comment, rating, created_at AS "createdAt"`,
    [input.projectId, input.authorName, input.comment, input.rating],
  );
  return result.rows[0];
}

async function findByProjectId(projectId) {
  const result = await database.query(
    `SELECT id, project_id AS "projectId", author_name AS "authorName",
       comment, rating, created_at AS "createdAt"
     FROM feedbacks WHERE project_id = $1 ORDER BY created_at DESC`,
    [projectId],
  );
  return result.rows;
}

module.exports = { create, findByProjectId };