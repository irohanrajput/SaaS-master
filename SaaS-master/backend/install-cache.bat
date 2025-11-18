@echo off
echo ========================================
echo SEO Analytics Cache - Quick Setup
echo ========================================
echo.

echo Step 1: Installing Supabase client...
cd backend
call npm install @supabase/supabase-js

echo.
echo ========================================
echo Step 2: Setup Instructions
echo ========================================
echo.
echo Please complete these manual steps:
echo.
echo 1. Add to backend/.env:
echo    SUPABASE_URL=https://your-project.supabase.co
echo    SUPABASE_ANON_KEY=your-anon-key-here
echo.
echo 2. Get your keys from:
echo    https://supabase.com/dashboard
echo    ^> Select your project
echo    ^> Settings ^> API
echo.
echo 3. Run SQL file in Supabase:
echo    ^> Open: backend/sql/seo_analytics_cache_tables.sql
echo    ^> Copy all contents
echo    ^> Paste in Supabase SQL Editor
echo    ^> Click RUN
echo.
echo 4. Restart your backend server
echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Press any key to exit...
pause > nul
