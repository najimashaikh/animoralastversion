@echo off
title Animora Studio - Launcher
echo ========================================================
echo        Starting Animora Studio (Frontend + Backend)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting PHP Backend API on http://localhost:8000 ...
start /b "Animora-Backend" php -S 127.0.0.1:8000 -t backend/public backend/public/router.php

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Vite Server on http://localhost:5173 ...
echo.
echo Opening Animora Studio in your browser...
start http://localhost:5173

pnpm --filter @workspace/animora-studio-library run dev
