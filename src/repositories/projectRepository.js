const database = require('../config/database');
const AppError = require('../utils/AppError');

function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    repositoryUrl: row.repository_url,
    demoUrl: row.demo_url,
    averageRating: Number(row.average_rating),
    upvotes: Number(row.upvotes),
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

async function findAll({ technology, page, limit }) {
  const filter = technology
    ? `WHERE EXISTS (
        SELECT 1
        FROM project_technologies filter_pt
        JOIN technologies filter_t ON filter_t.id = filter_pt.technology_id
        WHERE filter_pt.project_id = p.id AND lower(filter_t.name) = lower($1)
      )`
    : '';
  const countParams = technology ? [technology] : [];
  const limitPosition = countParams.length + 1;
  const offsetPosition = countParams.length + 2;

  const [projectsResult, countResult] = await Promise.all([
    database.query(
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
       ${filter}
       GROUP BY p.id, pr.id
       ORDER BY p.created_at DESC
       LIMIT $${limitPosition} OFFSET $${offsetPosition}`,
      [...countParams, limit, (page - 1) * limit],
    ),
    database.query(`SELECT COUNT(*)::int AS total FROM projects p ${filter}`, countParams),
  ]);

  return {
    projects: projectsResult.rows.map(mapProject),
    total: countResult.rows[0].total,
  };
}

async function upvote(projectId) {
  const result = await database.query(
    `UPDATE projects
     SET upvotes = upvotes + 1, updated_at = NOW()
     WHERE id = $1
     RETURNING id, upvotes`,
    [projectId],
  );
  return result.rows[0] || null;
}

module.exports = { create, findAll, upvote };