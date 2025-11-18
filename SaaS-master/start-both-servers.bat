@echo off
echo Starting SEO Dashboard - Frontend and Backend...
echo.
echo Starting Backend Server (Port 3010)...
start "Backend Server" cmd /k "cd /d C:\Users\Admin\Desktop\SaaS\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3002)...
start "Frontend Server" cmd /k "cd /d C:\Users\Admin\Desktop\SaaS\frontend && npm run dev"

echo.
echo Both servers are starting!
echo Frontend: http://localhost:3002
echo Backend: http://localhost:3010
echo.
echo Press any key to exit this window (servers will keep running)...
pause > nul