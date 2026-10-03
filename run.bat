@echo off
setlocal enabledelayedexpansion
title Quantaliez Auto - Application Launcher
cd /d "%~dp0"

echo ====================================================================
echo                  Quantaliez Auto - App Launcher
echo ====================================================================
echo Root Directory: %~dp0
echo.

:: 1. Check folder existence
if not exist "%~dp0backend" (
    echo [ERROR] backend directory not found at: %~dp0backend
    goto :err_exit
)

if not exist "%~dp0frontend" (
    echo [ERROR] frontend directory not found at: %~dp0frontend
    goto :err_exit
)

:: 2. Check if ports are already listening
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [NOTICE] Port 8000 is already in use.
    echo          If an old backend is running, you can run stop.bat to stop it.
)

netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [NOTICE] Port 5173 is already in use.
    echo          If an old frontend is running, you can run stop.bat to stop it.
)
echo.

:: 3. Launch Backend in a new dedicated window
echo [1/2] Launching Backend server (FastAPI on Port 8000)...
start "Quantaliez Auto - Backend (Port 8000)" cmd /k "call "%~dp0backend\run_backend.bat""

:: 4. Launch Frontend in a new dedicated window
echo [2/2] Launching Frontend server (Vite on Port 5173)...
start "Quantaliez Auto - Frontend (Port 5173)" cmd /k "call "%~dp0frontend\run_frontend.bat""

echo.
echo ====================================================================
echo Both servers are starting up in separate console windows:
echo.
echo   * Backend API:       http://127.0.0.1:8000
echo   * Interactive Docs:  http://127.0.0.1:8000/docs
echo   * Frontend Web App:  http://localhost:5173
echo.
echo Waiting 4 seconds before opening browser...
echo ====================================================================

timeout /t 4 >nul 2>&1

:: 5. Open browser
echo Opening http://localhost:5173 in default browser...
start http://localhost:5173

echo.
echo ====================================================================
echo [DONE] Application launched!
echo.
echo TIPS:
echo   - Keep the Backend and Frontend console windows OPEN while using the app.
echo   - To stop both services, double-click 'stop.bat'.
echo.
echo Press any key to close this launcher window (servers will remain running)...
pause >nul
exit /b 0

:err_exit
echo.
echo Press any key to exit...
pause >nul
exit /b 1
