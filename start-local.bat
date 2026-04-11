@echo off
REM Start IoT Virtual Lab locally (Windows)
REM This script starts both backend and frontend

echo.
echo ===============================================
echo  IoT Virtual Lab - Local Startup
echo ===============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. 
    echo Please install Node.js: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js found: %NODE_VER%
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

echo [*] Starting Backend (Port 5000)...
cd /d "%SCRIPT_DIR%backend"

if not exist "node_modules" (
    echo     Installing dependencies...
    call npm install >nul 2>&1
)

start "IoT_Backend" npm start
echo [OK] Backend started in new window
echo.

REM Wait for backend to initialize
timeout /t 2 /nobreak >nul

echo [*] Starting Frontend (Port 3000)...
cd /d "%SCRIPT_DIR%frontend"

if not exist "node_modules" (
    echo     Installing dependencies...
    call npm install >nul 2>&1
)

start "IoT_Frontend" npm run dev
echo [OK] Frontend started in new window
echo.

echo ===============================================
echo  SUCCESS - Both services are running!
echo ===============================================
echo.
echo   Dashboard:  http://localhost:3000
echo   Backend:    http://localhost:5000
echo.
echo   - Two new windows should have opened
echo   - Frontend will start in 30-60 seconds
echo   - Close windows to stop services
echo.
pause
