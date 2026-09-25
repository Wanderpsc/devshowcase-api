const database = require('../config/database');

function mapTechnology(row) {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

async function create(input) {
  const result = await database.query(
    'INSERT INTO technologies (name) VALUES ($1) RETURNING *',
    [input.name],
  );
  return mapTechnology(result.rows[0]);
}

async function findAll() {
  const result = await database.query('SELECT * FROM technologies ORDER BY name');
  return result.rows.map(mapTechnology);
}

module.exports = { create, findAll };