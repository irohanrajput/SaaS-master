@echo off
echo ============================================
echo AI Recommendations Diagnostic Tool
echo ============================================
echo.

echo Step 1: Checking if backend is running...
echo.
curl -s http://localhost:3010/api/status
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not responding on port 3010!
    echo Please start backend server first.
    echo.
    pause
    exit /b
)
echo [OK] Backend is running on port 3010
echo.

echo Step 2: Checking Gemini package installation...
echo.
cd backend
call npm list @google/generative-ai 2>nul | findstr "@google/generative-ai"
if %errorlevel% neq 0 (
    echo [ERROR] Package not installed!
    echo Installing @google/generative-ai...
    call npm install @google/generative-ai
)
echo [OK] Package is installed
echo.

echo Step 3: Checking API key in .env file...
echo.
findstr "GEMINI_API_KEY" .env >nul
if %errorlevel% neq 0 (
    echo [ERROR] GEMINI_API_KEY not found in .env file!
    echo Please add: GEMINI_API_KEY=your_api_key_here
    echo.
    pause
    exit /b
)
echo [OK] API key found in .env
echo.

echo Step 4: Testing Gemini Service...
echo.
node test-gemini.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gemini service test failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b
)

echo.
echo ============================================
echo All checks passed!
echo ============================================
echo.
echo If the button still doesn't work:
echo 1. Open browser DevTools (F12)
echo 2. Go to Console tab
echo 3. Click "Generate AI Insights" button
echo 4. Look for error messages
echo.
echo Then check Network tab for the API request.
echo.
pause
