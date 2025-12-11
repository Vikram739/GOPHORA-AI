@echo off
cd /d "%~dp0"
echo Starting Gophora - Full Stack Application
echo.
echo Starting Backend Server...
start "Gophora Backend" cmd /k python start_backend.py
timeout /t 5 /nobreak
echo.
echo Starting Frontend Server...
start "Gophora Frontend" cmd /k npm run dev
echo.
echo Both servers are starting in separate windows
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5174
echo.
pause
