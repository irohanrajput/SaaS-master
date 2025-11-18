@echo off
echo ========================================
echo   LinkedIn OAuth - Backend Server
echo ========================================
echo.
echo Starting backend server...
echo.

cd /d "%~dp0"
node server.js

pause
