@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 goto start_py

where python >nul 2>nul
if %errorlevel%==0 goto start_python

where npx >nul 2>nul
if %errorlevel%==0 goto start_node

echo Please install Python 3 or Node.js, then run this file again.
pause
exit /b 1

:start_py
start "Campus AR server" cmd /k "cd /d ""%~dp0"" && py -m http.server 8000"
goto open_browser

:start_python
start "Campus AR server" cmd /k "cd /d ""%~dp0"" && python -m http.server 8000"
goto open_browser

:start_node
start "Campus AR server" cmd /k "cd /d ""%~dp0"" && npx --yes http-server -p 8000"

:open_browser
timeout /t 1 /nobreak >nul
start "" "http://localhost:8000/index.html"
endlocal
