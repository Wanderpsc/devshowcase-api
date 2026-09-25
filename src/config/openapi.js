const idSchema = { type: 'string', format: 'uuid' };
const errorResponses = {
  422: { description: 'Dados de entrada invalidos' },
  500: { description: 'Erro interno do servidor' },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'DevShowcase API',
    version: '1.0.0',
    description: 'API REST para portfolios de desenvolvedores.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Ambiente local' }],
  tags: [
    { name: 'Profiles' },
    { name: 'Technologies' },
    { name: 'Projects' },
    { name: 'Feedbacks' },
  ],
  paths: {
    '/api/profiles': {
      post: {
        tags: ['Profiles'],
        summary: 'Cadastrar perfil',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileInput' } } },
        },
        responses: { 201: { description: 'Perfil criado' }, ...errorResponses },
      },
    },
    '/api/profiles/{id}': {
      get: {
        tags: ['Profiles'],
        summary: 'Buscar perfil por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: idSchema }],
        responses: { 200: { description: 'Perfil encontrado' }, 404: { description: 'Perfil nao encontrado' }, ...errorResponses },
      },
    },
    '/api/technologies': {
      post: {
        tags: ['Technologies'],
        summary: 'Cadastrar tecnologia',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnologyInput' } } },
        },
        responses: { 201: { description: 'Tecnologia criada' }, 409: { description: 'Tecnologia duplicada' }, ...errorResponses },
      },
      get: {
        tags: ['Technologies'],
        summary: 'Listar tecnologias',
        responses: { 200: { description: 'Lista de tecnologias' }, 500: errorResponses[500] },
      },
    },
    '/api/projects': {
      post: {
        tags: ['Projects'],
        summary: 'Cadastrar projeto',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectInput' } } },
        },
        responses: { 201: { description: 'Projeto criado' }, 404: { description: 'Perfil nao encontrado' }, ...errorResponses },
      },
      get: {
        tags: ['Projects'],
        summary: 'Listar projetos',
        responses: { 200: { description: 'Lista de projetos' }, 500: errorResponses[500] },
      },
    },
    '/api/projects/{projectId}/feedbacks': {
      post: {
        tags: ['Feedbacks'],
        summary: 'Cadastrar feedback de um projeto',
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: idSchema }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FeedbackInput' } } },
        },
        responses: { 201: { description: 'Feedback criado' }, ...errorResponses },
      },
      get: {
        tags: ['Feedbacks'],
        summary: 'Listar feedbacks de um projeto',
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: idSchema }],
        responses: { 200: { description: 'Lista de feedbacks' }, ...errorResponses },
      },
    },
  },
  components: {
    schemas: {
      ProfileInput: {
        type: 'object',
        required: ['name', 'email', 'githubUrl'],
        properties: {
          name: { type: 'string', example: 'Wander Pires Silva Coelho' },
          email: { type: 'string', format: 'email', example: 'wander@example.com' },
          bio: { type: 'string', example: 'Desenvolvedor backend' },
          githubUrl: { type: 'string', format: 'uri', example: 'https://github.com/Wanderpsc' },
        },
      },
      TechnologyInput: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', example: 'Node.js' } },
      },
      ProjectInput: {
        type: 'object',
        required: ['profileId', 'title', 'description', 'repositoryUrl', 'technologyIds'],
        properties: {
          profileId: idSchema,
          title: { type: 'string', example: 'DevShowcase API' },
          description: { type: 'string', example: 'API para portfolios de desenvolvedores' },
          repositoryUrl: { type: 'string', format: 'uri', example: 'https://github.com/Wanderpsc/devshowcase-api' },
          demoUrl: { type: 'string', format: 'uri', nullable: true },
          technologyIds: { type: 'array', items: idSchema },
        },
      },
      FeedbackInput: {
        type: 'object',
        required: ['authorName', 'comment', 'rating'],
        properties: {
          authorName: { type: 'string', example: 'Avaliador' },
          comment: { type: 'string', example: 'Projeto bem estruturado.' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
        },
      },
    },
  },
};