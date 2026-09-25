param(
    [string]$BaseUrl = 'http://localhost:3000'
)

$BaseUrl = $BaseUrl.TrimEnd('/')
$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$headers = @{ 'Content-Type' = 'application/json' }

$health = Invoke-RestMethod -Uri "$BaseUrl/health"
if ($health.status -ne 'ok') { throw 'Health check falhou.' }

$swagger = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/api-docs/"
if ($swagger.StatusCode -ne 200) { throw 'Swagger nao esta acessivel.' }

$profileBody = @{
    name = 'Wander Pires Silva Coelho'
    email = "wander.$suffix@example.com"
    bio = 'Desenvolvedor backend'
    githubUrl = 'https://github.com/Wanderpsc'
} | ConvertTo-Json
$developerProfile = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/profiles" -Headers $headers -Body $profileBody

$technologyBody = @{ name = "Node.js $suffix" } | ConvertTo-Json
$technology = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/technologies" -Headers $headers -Body $technologyBody

$projectBody = @{
    profileId = $developerProfile.id
    title = 'DevShowcase API'
    description = 'API para portfolios de desenvolvedores'
    repositoryUrl = 'https://github.com/Wanderpsc/devshowcase-api'
    technologyIds = @($technology.id)
} | ConvertTo-Json
$project = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/projects" -Headers $headers -Body $projectBody

$feedbackBody = @{
    authorName = 'Teste integrado'
    comment = 'Persistencia e relacionamentos validados.'
    rating = 5
} | ConvertTo-Json
$feedbackResult = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/projects/$($project.id)/feedbacks" -Headers $headers -Body $feedbackBody
$upvote = Invoke-RestMethod -Method Put -Uri "$BaseUrl/api/projects/$($project.id)/upvote"

$profileResult = Invoke-RestMethod -Uri "$BaseUrl/api/profiles/$($developerProfile.id)"
$technologies = Invoke-RestMethod -Uri "$BaseUrl/api/technologies"
$projects = Invoke-RestMethod -Uri "$BaseUrl/api/projects?technology=$([uri]::EscapeDataString($technology.name))&page=1&limit=10"
$feedbacks = Invoke-RestMethod -Uri "$BaseUrl/api/projects/$($project.id)/feedbacks"

if ($profileResult.projects.id -notcontains $project.id) { throw 'Relacionamento Profile 1:N Project nao foi persistido.' }
if ($projects.data.id -notcontains $project.id) { throw 'Projeto nao foi filtrado e listado.' }
if ($projects.pagination.total -lt 1) { throw 'Paginacao nao retornou o total esperado.' }
if ($technologies.id -notcontains $technology.id) { throw 'Tecnologia nao foi listada.' }
if ($feedbacks.id -notcontains $feedbackResult.feedback.id) { throw 'Feedback nao foi listado.' }
if ($feedbackResult.averageRating -ne 5) { throw 'Nota media nao foi atualizada.' }
if ($upvote.upvotes -ne 1) { throw 'Upvote nao foi incrementado.' }

try {
    Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/projects" -Headers $headers -Body '{'
    throw 'A API aceitou JSON malformado.'
} catch {
    if ([int]$_.Exception.Response.StatusCode -ne 400) { throw }
}

try {
    Invoke-RestMethod -Method Put -Uri "$BaseUrl/api/projects/523e4567-e89b-42d3-a456-426614174000/upvote"
    throw 'A API nao retornou 404 para projeto ausente.'
} catch {
    if ([int]$_.Exception.Response.StatusCode -ne 404) { throw }
}

Write-Output 'Smoke test concluido com sucesso.'
Write-Output "API: $BaseUrl"
Write-Output "Profile: $($developerProfile.id)"
Write-Output "Technology: $($technology.id)"
Write-Output "Project: $($project.id)"
Write-Output "Feedback: $($feedbackResult.feedback.id)"
Write-Output "Average rating: $($feedbackResult.averageRating)"
Write-Output "Upvotes: $($upvote.upvotes)"