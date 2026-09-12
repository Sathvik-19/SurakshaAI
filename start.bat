@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo        SURAKSHA AI - ONE CLICK START
echo ==============================================

echo.
if not exist "backend\.venv\Scripts\python.exe" (
  echo [1/3] Creating Python virtual environment...
  where py >nul 2>nul && py -m venv "backend\.venv" || python -m venv "backend\.venv"
)

if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: Python virtual environment could not be created.
  pause
  exit /b 1
)

echo [2/3] Checking Python dependencies...
"backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 (
  echo ERROR: Backend dependencies failed to install.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [3/3] Installing frontend dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: Frontend dependencies failed to install.
    pause
    exit /b 1
  )
) else (
  echo [3/3] Frontend dependencies already installed.
)

echo.
echo Starting SURAKSHA AI backend and frontend...
start "SURAKSHA AI Backend" cmd /k "cd /d "%~dp0backend" && call .venv\Scripts\activate.bat && python app.py"
timeout /t 2 /nobreak >nul
start "SURAKSHA AI Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo ==============================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api/health
echo ==============================================
echo.
pause
