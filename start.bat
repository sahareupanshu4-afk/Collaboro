@echo off
echo ================================
echo Remote Work Platform - Quick Start
echo ================================
echo.

REM Check if .env files exist
if not exist "backend\.env" (
    echo [WARNING] backend\.env not found!
    echo Please create backend\.env from backend\.env.example
    echo.
    pause
    exit /b
)

if not exist "frontend\.env" (
    echo [WARNING] frontend\.env not found!
    echo Please create frontend\.env from frontend\.env.example
    echo.
    pause
    exit /b
)

echo [INFO] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo Servers Starting...
echo ================================
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq Backend Server*" /T /F
taskkill /FI "WindowTitle eq Frontend Server*" /T /F

echo.
echo Servers stopped.
pause
