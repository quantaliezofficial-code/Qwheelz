@echo off
title Quantaliez Auto - Backend (Port 8000)
cd /d "%~dp0"

echo ====================================================================
echo                     Quantaliez Auto - Backend
echo ====================================================================
echo Working Directory: %~dp0
echo.

:: 1. Activate Virtual Environment
if exist "venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment: backend\venv
    call "venv\Scripts\activate.bat"
) else if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment: backend\.venv
    call ".venv\Scripts\activate.bat"
) else (
    echo [WARNING] No venv found in backend\venv or backend\.venv.
    echo Trying system Python...
)

:: 2. Check Python availability
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.11+ and try again.
    pause
    exit /b 1
)

:: 3. Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] No .env found. Creating .env from .env.example...
        copy ".env.example" ".env" >nul
    ) else (
        echo [WARNING] No .env or .env.example found.
    )
)

echo.
echo [INFO] Starting FastAPI server with Uvicorn...
echo [INFO] API Base URL:    http://127.0.0.1:8000
echo [INFO] Swagger Docs:    http://127.0.0.1:8000/docs
echo ====================================================================
echo.

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend server stopped or crashed with exit code %ERRORLEVEL%.
    pause
)
