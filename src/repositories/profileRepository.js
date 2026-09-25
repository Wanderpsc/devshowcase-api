const database = require('../config/database');

function mapProfile(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    bio: row.bio,
    githubUrl: row.github_url,
    projects: row.projects || [],
    createdAt: row.created_at,
  };
}

async function create(input) {
  const result = await database.query(
    `INSERT INTO profiles (name, email, bio, github_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.name, input.email, input.bio, input.githubUrl],
  );
  return mapProfile(result.rows[0]);
}

async function findById(id) {
  const result = await database.query(
    `SELECT p.*,
       COALESCE(json_agg(json_build_object(
         'id', pr.id, 'title', pr.title, 'repositoryUrl', pr.repository_url
       ) ORDER BY pr.created_at DESC) FILTER (WHERE pr.id IS NOT NULL), '[]') AS projects
     FROM profiles p
     LEFT JOIN projects pr ON pr.profile_id = p.id
     WHERE p.id = $1
     GROUP BY p.id`,
    [id],
  );
  return result.rows[0] ? mapProfile(result.rows[0]) : null;
}

module.exports = { create, findById };