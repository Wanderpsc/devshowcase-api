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

No Windows, também é possível gerar o `.env` sem exibir a senha:

```powershell
.\scripts\configure-env.ps1
npm run db:init
```

A documentação interativa Swagger fica em `http://localhost:3000/api-docs`.

Produção: `https://devshowcase-api-7uq6.onrender.com`

Swagger em produção: `https://devshowcase-api-7uq6.onrender.com/api-docs/`

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/profiles` | Cadastra um perfil |
| GET | `/api/profiles/:id` | Busca um perfil e seus projetos |
| POST | `/api/technologies` | Cadastra uma tecnologia |
| GET | `/api/technologies` | Lista tecnologias |
| POST | `/api/projects` | Cadastra um projeto e associa tecnologias |
| GET | `/api/projects?technology=Node.js&page=1&limit=10` | Filtra e pagina projetos |
| POST | `/api/projects/:projectId/feedbacks` | Cadastra feedback e recalcula a nota média |
| PUT | `/api/projects/:projectId/upvote` | Incrementa as curtidas do projeto |
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

Campos obrigatórios, e-mail, UUIDs e URLs são validados. JSON malformado retorna `400`, recursos ausentes retornam `404`, outros dados inválidos retornam `422` e registros duplicados retornam `409`.

## Testes

```powershell
npm test
```

Os testes HTTP automatizados cobrem os endpoints solicitados, paginação, média, upvote e tratamento global de erros.

## Postman

Importe `docs/DevShowcase.postman_collection.json`. Execute as requisições na ordem da coleção; os IDs retornados são armazenados automaticamente. As duas últimas requisições demonstram os erros `404` e `400`.

## Deploy no Render

O arquivo `render.yaml` provisiona a API e um PostgreSQL gerenciado, executa o schema antes de cada deploy e configura deploy contínuo a cada commit.

1. Publique o código em um repositório GitHub.
2. No Render, escolha **New > Blueprint** e conecte o repositório.
3. Confirme os recursos `devshowcase-api` e `devshowcase-db`.
4. Aguarde o deploy e valide `/health`, `/api-docs` e os endpoints pelo Postman.

O Render injeta `DATABASE_URL` a partir do banco provisionado e `PORT` automaticamente. Nunca envie o arquivo `.env` ao GitHub.

## Roteiro do vídeo (5 a 8 minutos)

1. Apresentar-se em câmera com o nome completo.
2. Mostrar rapidamente as pastas, o esquema SQL e os relacionamentos.
3. Mostrar o Swagger da API em produção e o banco PostgreSQL no Render.
4. No Postman, criar os dados e demonstrar filtro/paginação, feedback com nota média e upvote.
5. Executar as requisições de demonstração dos erros `404` e `400`.
6. Executar `npm test` e mostrar os testes aprovados.

## Entrega

Publique este projeto no GitHub e o vídeo como não listado no YouTube. O PDF enviado na atividade deve conter os três links claramente identificados:

```text
Repositório GitHub: https://github.com/SEU_USUARIO/devshowcase-api
API em produção: https://devshowcase-api-7uq6.onrender.com
Vídeo no YouTube: https://youtu.be/SEU_VIDEO
```