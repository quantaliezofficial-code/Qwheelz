@echo off
setlocal enabledelayedexpansion
title Quantaliez Auto - Stop Services
cd /d "%~dp0"

echo ====================================================================
echo                  Stopping Quantaliez Auto Services
echo ====================================================================
echo.

set STOPPED_ANY=0

:: Terminate Backend processes listening on port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    set STOPPED_ANY=1
    echo [INFO] Stopping Backend process on port 8000 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
    echo [OK] Backend process terminated.
)

:: Terminate Frontend processes listening on port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    set STOPPED_ANY=1
    echo [INFO] Stopping Frontend process on port 5173 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
    echo [OK] Frontend process terminated.
)

if "%STOPPED_ANY%"=="0" (
    echo [INFO] No active servers found listening on ports 8000 or 5173.
) else (
    echo.
    echo [SUCCESS] Quantaliez Auto servers have been stopped.
)

echo.
echo ====================================================================
echo Closing in 3 seconds (or press any key to close now)...
timeout /t 3 >nul 2>&1
exit /b 0
