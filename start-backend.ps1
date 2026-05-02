# PowerShell script to start the Django backend server
Write-Host "Starting Django Backend Server..." -ForegroundColor Green
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"

# Check if virtual environment exists
$venvPath = Join-Path $backendPath "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv $venvPath
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & "$venvPath\Scripts\python.exe" -m pip install --upgrade pip
    & "$venvPath\Scripts\pip.exe" install -r (Join-Path $backendPath "requirements.txt")
}

# Activate virtual environment and run server
Set-Location $backendPath
& "$venvPath\Scripts\python.exe" manage.py runserver
