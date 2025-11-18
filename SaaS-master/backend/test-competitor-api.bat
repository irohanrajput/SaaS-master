@echo off
echo Testing Backend Competitor API...
echo.

curl -X POST http://localhost:3010/api/competitor/analyze ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"yourSite\":\"example.com\",\"competitorSite\":\"competitor.com\"}"

echo.
echo.
pause
