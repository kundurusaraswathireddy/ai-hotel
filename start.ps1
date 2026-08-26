# HotelGuard AI - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       HOTELGUARD AI - LAUNCHING SYSTEM" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH = "C:\Users\ksara\.nodejs;C:\Users\ksara\.python311;C:\Users\ksara\.python311\Scripts;$env:PATH"

Write-Host "`n[1/2] Starting FastAPI ML Backend (http://127.0.0.1:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\ksara\.nodejs;C:\Users\ksara\.python311;C:\Users\ksara\.python311\Scripts;' + `$env:PATH; python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting React Vite Frontend (http://localhost:3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\ksara\.nodejs;C:\Users\ksara\.python311;C:\Users\ksara\.python311\Scripts;' + `$env:PATH; Set-Location 'frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "       HOTELGUARD AI IS NOW RUNNING!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

Start-Process "http://localhost:3000"
