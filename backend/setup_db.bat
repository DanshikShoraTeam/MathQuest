@echo off
cd /d "%~dp0"

echo [1/4] venv тексерілуде...
if not exist "venv" (
    echo venv жасалуда...
    python -m venv venv
)

echo [2/4] Пакеттер орнатылуда...
call venv\Scripts\activate
pip install -r requirements.txt -q

echo [3/4] Миграциялар қолданылуда...
python manage.py migrate

echo [4/4] Admin жасалуда...
python manage.py shell -c "from education.models import User; u=User.objects.create_superuser('admin','admin@mathquest.kz','admin') if not User.objects.filter(username='admin').exists() else None; u.role='ADMIN'; u.save() if u else print('admin бұрыннан бар')"

echo.
echo Дайын! Енді start_backend.bat іске қосыңыз.
pause
