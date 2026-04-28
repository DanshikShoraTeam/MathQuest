@echo off
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo node_modules жоқ, npm install іске қосылуда...
    npm install
)

echo Frontend іске қосылуда: http://localhost:5173
npm run dev
