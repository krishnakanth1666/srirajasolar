@echo off
echo Starting Both Frontend and Backend Servers...
echo.

REM Start backend in a new window
start "Django Backend" powershell -NoExit -File "%~dp0start-backend.ps1"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Angular Frontend" powershell -NoExit -File "%~dp0start-frontend.ps1"

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:4200
echo.
pause
