# DevShowcase API

API REST em Node.js, Express e PostgreSQL para cadastrar perfis de desenvolvedores, projetos, tecnologias e feedbacks.

## Modelo relacional

- `Profile 1:N Project`: cada projeto pertence a um perfil.
- `Project N:N Technology`: associação pela tabela `project_technologies`.
- `Project 1:N Feedback`: cada feedback pertence a um projeto.

O esquema completo está em `src/config/schema.sql`. A persistência usa consultas parametrizadas do driver `pg`, com transação na criação de projetos e tecnologias associadas.

## Executar localmente

Requisitos: Node.js 20 ou superior, Docker e Docker Compose.

```powershell
Copy-Item .env.example .env
docker compose up -d
npm run db:init
npm start
```

A API ficará disponível em `http://localhost:3000`. Para verificar:

```text
GET http://localhost:3000/health
```

Se o PostgreSQL já estiver instalado localmente, crie o banco `devshowcase`, copie `.env.example` para `.env`, ajuste a senha na `DATABASE_URL` e execute `npm run db:init`.

A documentação interativa Swagger fica em `http://localhost:3000/api-docs`.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/profiles` | Cadastra um perfil |
| GET | `/api/profiles/:id` | Busca um perfil e seus projetos |
| POST | `/api/technologies` | Cadastra uma tecnologia |
| GET | `/api/technologies` | Lista tecnologias |
| POST | `/api/projects` | Cadastra um projeto e associa tecnologias |
| GET | `/api/projects` | Lista projetos, tecnologias e feedbacks |
| POST | `/api/projects/:projectId/feedbacks` | Cadastra uma opinião |
| GET | `/api/projects/:projectId/feedbacks` | Lista opiniões do projeto |

### Exemplos para o Postman

Cadastre primeiro o perfil:

```json
{
  "name": "Wander Pires Silva Coelho",
  "email": "wander@example.com",
  "bio": "Desenvolvedor backend",
  "githubUrl": "https://github.com/seu-usuario"
}
```

Depois cadastre uma tecnologia:

```json
{
  "name": "Node.js"
}
```

Copie os IDs retornados e cadastre o projeto:

```json
{
  "profileId": "UUID_DO_PERFIL",
  "title": "DevShowcase API",
  "description": "API para apresentacao de projetos de desenvolvedores",
  "repositoryUrl": "https://github.com/seu-usuario/devshowcase-api",
  "demoUrl": "https://example.com",
  "technologyIds": ["UUID_DA_TECNOLOGIA"]
}
```

Campos obrigatórios, e-mail, UUIDs e URLs são validados. Erros de entrada retornam HTTP `422`, registros duplicados retornam `409` e recursos ausentes retornam `404`.

## Testes

```powershell
npm test
```

Os testes HTTP automatizados cobrem os seis endpoints solicitados e as validações principais.

## Postman

Importe `docs/DevShowcase.postman_collection.json`. Execute as requisições na ordem da coleção; os IDs retornados são armazenados automaticamente nas variáveis usadas pelas etapas seguintes.

## Roteiro do vídeo (5 a 8 minutos)

1. Apresentar-se em câmera com o nome completo.
2. Mostrar rapidamente as pastas, o esquema SQL e os relacionamentos.
3. Iniciar o PostgreSQL, preparar o banco e executar a API.
4. No Postman, executar os seis endpoints na ordem apresentada acima.
5. Mostrar uma validação falhando com HTTP `422`.
6. Executar `npm test` e mostrar os testes aprovados.

## Entrega

Publique este projeto em um repositório público no GitHub e o vídeo como não listado no YouTube. O PDF enviado na atividade deve conter somente os dois links, claramente identificados:

```text
Repositório GitHub: https://github.com/SEU_USUARIO/devshowcase-api
Vídeo no YouTube: https://youtu.be/SEU_VIDEO
```