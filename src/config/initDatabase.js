const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config();

const { pool } = require('./database');

async function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Banco de dados inicializado com sucesso.');
}

initDatabase()
  .catch((error) => {
    console.error('Falha ao inicializar o banco de dados:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());