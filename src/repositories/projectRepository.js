const database = require('../config/database');
const AppError = require('../utils/AppError');

function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    repositoryUrl: row.repository_url,
    demoUrl: row.demo_url,
    profile: row.profile,
    technologies: row.technologies || [],
    feedbacks: row.feedbacks || [],
    createdAt: row.created_at,
  };
}

async function selectProjects(client, projectId) {
  const params = projectId ? [projectId] : [];
  const where = projectId ? 'WHERE p.id = $1' : '';
  return client.query(
    `SELECT p.*,
       json_build_object('id', pr.id, 'name', pr.name) AS profile,
       COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name))
         FILTER (WHERE t.id IS NOT NULL), '[]') AS technologies,
       COALESCE(json_agg(DISTINCT jsonb_build_object(
         'id', f.id, 'authorName', f.author_name, 'comment', f.comment,
         'rating', f.rating, 'createdAt', f.created_at
       )) FILTER (WHERE f.id IS NOT NULL), '[]') AS feedbacks
     FROM projects p
     JOIN profiles pr ON pr.id = p.profile_id
     LEFT JOIN project_technologies pt ON pt.project_id = p.id
     LEFT JOIN technologies t ON t.id = pt.technology_id
     LEFT JOIN feedbacks f ON f.project_id = p.id
     ${where}
     GROUP BY p.id, pr.id
     ORDER BY p.created_at DESC`,
    params,
  );
}

async function create(input) {
  return database.transaction(async (client) => {
    const profile = await client.query('SELECT id FROM profiles WHERE id = $1', [input.profileId]);
    if (profile.rowCount === 0) throw new AppError('Perfil nao encontrado.', 404);

    if (input.technologyIds.length > 0) {
      const technologies = await client.query(
        'SELECT id FROM technologies WHERE id = ANY($1::uuid[])',
        [input.technologyIds],
      );
      if (technologies.rowCount !== input.technologyIds.length) {
        throw new AppError('Uma ou mais tecnologias nao foram encontradas.', 422);
      }
    }

    const inserted = await client.query(
      `INSERT INTO projects
         (profile_id, title, description, repository_url, demo_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [input.profileId, input.title, input.description, input.repositoryUrl, input.demoUrl],
    );
    const projectId = inserted.rows[0].id;

    if (input.technologyIds.length > 0) {
      await client.query(
        `INSERT INTO project_technologies (project_id, technology_id)
         SELECT $1, unnest($2::uuid[])`,
        [projectId, input.technologyIds],
      );
    }

    const result = await selectProjects(client, projectId);
    return mapProject(result.rows[0]);
  });
}

async function findAll() {
  const result = await selectProjects(database);
  return result.rows.map(mapProject);
}

module.exports = { create, findAll };