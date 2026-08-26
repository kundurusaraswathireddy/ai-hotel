@echo off
title HotelGuard AI - Autonomous Hotel Cancellation Intelligence
echo ========================================================
echo        HOTELGUARD AI - LAUNCHING SYSTEM
echo ========================================================
echo.

set PATH=C:\Users\ksara\.nodejs;C:\Users\ksara\.python311;C:\Users\ksara\.python311\Scripts;%PATH%

echo [1/2] Starting FastAPI ML Backend on http://127.0.0.1:8000 ...
start "HotelGuard AI - FastAPI ML Backend" cmd /k "python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://localhost:3000 ...
start "HotelGuard AI - React Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo       HOTELGUARD AI IS NOW RUNNING!
echo ========================================================
echo  Dashboard: http://localhost:3000
echo  API Docs:  http://127.0.0.1:8000/docs
echo ========================================================
echo Opening browser...
start http://localhost:3000
