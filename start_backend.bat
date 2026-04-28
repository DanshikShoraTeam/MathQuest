@echo off
cd /d "%~dp0backend"
call venv\Scripts\activate
echo Backend іске қосылуда: http://127.0.0.1:8000
python manage.py runserver
