# PowerShell script to start the Angular frontend server
Write-Host "Starting Angular Frontend Server..." -ForegroundColor Green
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "frontend"

# Check if node_modules exists
$nodeModulesPath = Join-Path $frontendPath "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Node modules not found. Installing dependencies..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
}

# Start the Angular development server
Set-Location $frontendPath
npm start
