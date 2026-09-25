require('dotenv').config();

const createApp = require('./app');
const { pool } = require('./config/database');

const port = Number(process.env.PORT) || 3000;
const server = createApp().listen(port, () => {
  console.log(`DevShowcase API executando em http://localhost:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);