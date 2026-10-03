@echo off
title Quantaliez Auto - Frontend (Port 5173)
cd /d "%~dp0"

echo ====================================================================
echo                     Quantaliez Auto - Frontend
echo ====================================================================
echo Working Directory: %~dp0
echo.

:: 1. Check Node.js availability
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

:: 2. Check npm availability
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)

:: 3. Check node_modules
if not exist "node_modules" (
    echo [INFO] node_modules folder missing. Running npm install...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b %ERRORLEVEL%
    )
)

echo [INFO] Starting Vite development server...
echo [INFO] Frontend URL: http://localhost:5173
echo ====================================================================
echo.

call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend server stopped or crashed with exit code %ERRORLEVEL%.
    pause
)
