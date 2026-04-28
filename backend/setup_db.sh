#!/bin/bash

# MathQuest — толық баптау скрипті
# Пайдалану: ./setup_db.sh

cd "$(dirname "$0")"

# 1. venv жоқ болса — жасайды
if [ ! -d "venv" ]; then
    echo "venv жасалуда..."
    python3 -m venv venv
fi

source venv/bin/activate

# 2. Пакеттерді орнату
echo "Пакеттер орнатылуда..."
pip install -r requirements.txt -q

# 3. Миграциялар
echo "Миграциялар қолданылуда..."
python manage.py migrate

# 4. Admin жасау
echo "Admin тексерілуде..."
python manage.py shell -c "
from education.models import User
if not User.objects.filter(username='admin').exists():
    u = User.objects.create_superuser('admin', 'admin@mathquest.kz', 'admin')
    u.role = 'ADMIN'
    u.save()
    print('Жасалды: admin / admin')
else:
    print('admin бұрыннан бар')
"

echo ""
echo "Дайын! Серверді іске қосу:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
