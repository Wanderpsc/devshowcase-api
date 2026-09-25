$baseUrl = 'http://localhost:3000'
$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$headers = @{ 'Content-Type' = 'application/json' }

$health = Invoke-RestMethod -Uri "$baseUrl/health"
if ($health.status -ne 'ok') { throw 'Health check falhou.' }

$profileBody = @{
    name = 'Wander Pires Silva Coelho'
    email = "wander.$suffix@example.com"
    bio = 'Desenvolvedor backend'
    githubUrl = 'https://github.com/Wanderpsc'
} | ConvertTo-Json
$profile = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/profiles" -Headers $headers -Body $profileBody

$technologyBody = @{ name = "Node.js $suffix" } | ConvertTo-Json
$technology = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/technologies" -Headers $headers -Body $technologyBody

$projectBody = @{
    profileId = $profile.id
    title = 'DevShowcase API'
    description = 'API para portfolios de desenvolvedores'
    repositoryUrl = 'https://github.com/Wanderpsc/devshowcase-api'
    technologyIds = @($technology.id)
} | ConvertTo-Json
$project = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/projects" -Headers $headers -Body $projectBody

$feedbackBody = @{
    authorName = 'Teste integrado'
    comment = 'Persistencia e relacionamentos validados.'
    rating = 5
} | ConvertTo-Json
$feedback = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/projects/$($project.id)/feedbacks" -Headers $headers -Body $feedbackBody

$profileResult = Invoke-RestMethod -Uri "$baseUrl/api/profiles/$($profile.id)"
$technologies = Invoke-RestMethod -Uri "$baseUrl/api/technologies"
$projects = Invoke-RestMethod -Uri "$baseUrl/api/projects"
$feedbacks = Invoke-RestMethod -Uri "$baseUrl/api/projects/$($project.id)/feedbacks"

if ($profileResult.projects.id -notcontains $project.id) { throw 'Relacionamento Profile 1:N Project nao foi persistido.' }
if ($projects.id -notcontains $project.id) { throw 'Projeto nao foi listado.' }
if ($technologies.id -notcontains $technology.id) { throw 'Tecnologia nao foi listada.' }
if ($feedbacks.id -notcontains $feedback.id) { throw 'Feedback nao foi listado.' }

Write-Output 'Smoke test concluido com sucesso.'
Write-Output "Profile: $($profile.id)"
Write-Output "Technology: $($technology.id)"
Write-Output "Project: $($project.id)"
Write-Output "Feedback: $($feedback.id)"