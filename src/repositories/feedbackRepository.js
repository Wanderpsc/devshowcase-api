const database = require('../config/database');
const AppError = require('../utils/AppError');

async function create(input) {
  return database.transaction(async (client) => {
    const project = await client.query('SELECT id FROM projects WHERE id = $1 FOR UPDATE', [input.projectId]);
    if (project.rowCount === 0) throw new AppError('Projeto nao encontrado.', 404);

    const inserted = await client.query(
      `INSERT INTO feedbacks (project_id, author_name, comment, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, project_id AS "projectId", author_name AS "authorName",
         comment, rating, created_at AS "createdAt"`,
      [input.projectId, input.authorName, input.comment, input.rating],
    );
    const updated = await client.query(
      `UPDATE projects
       SET average_rating = (
         SELECT ROUND(AVG(rating)::numeric, 2) FROM feedbacks WHERE project_id = $1
       ), updated_at = NOW()
       WHERE id = $1
       RETURNING average_rating AS "averageRating"`,
      [input.projectId],
    );

    return { feedback: inserted.rows[0], averageRating: updated.rows[0].averageRating };
  });
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