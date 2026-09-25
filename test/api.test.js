const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const feedbackRepository = require('../src/repositories/feedbackRepository');
const profileRepository = require('../src/repositories/profileRepository');
const projectRepository = require('../src/repositories/projectRepository');
const technologyRepository = require('../src/repositories/technologyRepository');

const PROFILE_ID = '123e4567-e89b-42d3-a456-426614174000';
const TECHNOLOGY_ID = '223e4567-e89b-42d3-a456-426614174000';
const PROJECT_ID = '323e4567-e89b-42d3-a456-426614174000';
const FEEDBACK_ID = '423e4567-e89b-42d3-a456-426614174000';
const CREATED_AT = '2026-09-24T12:00:00.000Z';

let baseUrl;
let server;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  const body = await response.json();
  return { body, status: response.status };
}

before(() => {
  profileRepository.create = async (input) => ({ id: PROFILE_ID, ...input, createdAt: CREATED_AT });
  profileRepository.findById = async (id) => ({
    id,
    name: 'Wander Pires',
    email: 'wander@example.com',
    bio: 'Desenvolvedor backend',
    githubUrl: 'https://github.com/wander',
    projects: [],
    createdAt: CREATED_AT,
  });
  technologyRepository.create = async (input) => ({ id: TECHNOLOGY_ID, ...input, createdAt: CREATED_AT });
  technologyRepository.findAll = async () => [{ id: TECHNOLOGY_ID, name: 'Node.js', createdAt: CREATED_AT }];
  projectRepository.create = async (input) => ({
    id: PROJECT_ID,
    ...input,
    profile: { id: PROFILE_ID, name: 'Wander Pires' },
    technologies: [{ id: TECHNOLOGY_ID, name: 'Node.js' }],
    feedbacks: [],
    createdAt: CREATED_AT,
  });
  projectRepository.findAll = async () => ({
    projects: [{
      id: PROJECT_ID,
      title: 'DevShowcase API',
      description: 'API de portfolio',
      repositoryUrl: 'https://github.com/wander/devshowcase-api',
      demoUrl: null,
      averageRating: 5,
      upvotes: 2,
      profile: { id: PROFILE_ID, name: 'Wander Pires' },
      technologies: [{ id: TECHNOLOGY_ID, name: 'Node.js' }],
      feedbacks: [],
      createdAt: CREATED_AT,
    }],
    total: 1,
  });
  projectRepository.upvote = async (id) => (id === PROJECT_ID ? { id, upvotes: 3 } : null);
  feedbackRepository.create = async (input) => ({
    feedback: { id: FEEDBACK_ID, ...input, createdAt: CREATED_AT },
    averageRating: 5,
  });
  feedbackRepository.findByProjectId = async (projectId) => [{
    id: FEEDBACK_ID,
    projectId,
    authorName: 'Avaliador',
    comment: 'Projeto bem estruturado.',
    rating: 5,
    createdAt: CREATED_AT,
  }];

  const app = require('../src/app')();
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('POST /api/profiles cadastra um perfil', async () => {
  const result = await request('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Wander Pires',
      email: 'wander@example.com',
      bio: 'Desenvolvedor backend',
      githubUrl: 'https://github.com/wander',
    }),
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.id, PROFILE_ID);
});

test('GET /api/profiles/:id busca um perfil', async () => {
  const result = await request(`/api/profiles/${PROFILE_ID}`);
  assert.equal(result.status, 200);
  assert.equal(result.body.name, 'Wander Pires');
});

test('POST /api/technologies cadastra uma tecnologia', async () => {
  const result = await request('/api/technologies', {
    method: 'POST',
    body: JSON.stringify({ name: 'Node.js' }),
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.name, 'Node.js');
});

test('GET /api/technologies lista tecnologias', async () => {
  const result = await request('/api/technologies');
  assert.equal(result.status, 200);
  assert.equal(result.body.length, 1);
});

test('POST /api/projects cadastra projeto e relacionamentos', async () => {
  const result = await request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      profileId: PROFILE_ID,
      title: 'DevShowcase API',
      description: 'API de portfolio',
      repositoryUrl: 'https://github.com/wander/devshowcase-api',
      technologyIds: [TECHNOLOGY_ID],
    }),
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.technologies[0].id, TECHNOLOGY_ID);
});

test('GET /api/projects filtra e pagina projetos', async () => {
  const result = await request('/api/projects?technology=Node.js&page=1&limit=10');
  assert.equal(result.status, 200);
  assert.equal(result.body.data[0].title, 'DevShowcase API');
  assert.deepEqual(result.body.pagination, { page: 1, limit: 10, total: 1, totalPages: 1 });
});

test('POST /api/projects/:projectId/feedbacks cadastra feedback', async () => {
  const result = await request(`/api/projects/${PROJECT_ID}/feedbacks`, {
    method: 'POST',
    body: JSON.stringify({
      authorName: 'Avaliador',
      comment: 'Projeto bem estruturado.',
      rating: 5,
    }),
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.feedback.id, FEEDBACK_ID);
  assert.equal(result.body.feedback.rating, 5);
  assert.equal(result.body.averageRating, 5);
});

test('PUT /api/projects/:projectId/upvote incrementa curtidas', async () => {
  const result = await request(`/api/projects/${PROJECT_ID}/upvote`, { method: 'PUT' });
  assert.equal(result.status, 200);
  assert.equal(result.body.upvotes, 3);
});

test('PUT /api/projects/:projectId/upvote retorna 404 para projeto ausente', async () => {
  const missingId = '523e4567-e89b-42d3-a456-426614174000';
  const result = await request(`/api/projects/${missingId}/upvote`, { method: 'PUT' });
  assert.equal(result.status, 404);
  assert.equal(result.body.error, 'Projeto nao encontrado.');
});

test('GET /api/projects/:projectId/feedbacks lista feedbacks', async () => {
  const result = await request(`/api/projects/${PROJECT_ID}/feedbacks`);
  assert.equal(result.status, 200);
  assert.equal(result.body[0].projectId, PROJECT_ID);
});

test('GET /openapi.json disponibiliza a especificacao', async () => {
  const result = await request('/openapi.json');
  assert.equal(result.status, 200);
  assert.equal(result.body.openapi, '3.0.3');
  assert.ok(result.body.paths['/api/projects/{projectId}/feedbacks']);
});

test('campos obrigatorios e URLs invalidas retornam 422', async () => {
  const result = await request('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ name: '', email: 'invalido', githubUrl: 'github' }),
  });
  assert.equal(result.status, 422);
  assert.equal(result.body.error, 'Dados de entrada invalidos.');
});

test('JSON malformado retorna 400', async () => {
  const result = await request('/api/projects', { method: 'POST', body: '{' });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'JSON invalido.');
});