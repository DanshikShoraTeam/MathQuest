"""
MathQuest — тестовые данные
Запуск: python seed_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from education.models import User, Course, Section, Lesson, Material

print("Очищаем старые данные...")
Material.objects.all().delete()
Lesson.objects.all().delete()
Section.objects.all().delete()
Course.objects.all().delete()
User.objects.filter(username__in=[
    'teacher1', 'teacher2',
    'aizat', 'bekzat', 'dariga', 'nurlan', 'saule',
    'arman', 'gulnaz', 'timur', 'zarina', 'dias'
]).delete()

# ── Мұғалімдер ──────────────────────────────────────────────
print("Мұғалімдер жасалуда...")
t1 = User.objects.create_user('teacher1', 'teacher1@mathquest.kz', 'teacher1')
t1.role = 'TEACHER'; t1.save()

t2 = User.objects.create_user('teacher2', 'teacher2@mathquest.kz', 'teacher2')
t2.role = 'TEACHER'; t2.save()

# ── Оқушылар ────────────────────────────────────────────────
print("Оқушылар жасалуда...")
students_data = [
    ('aizat',  'aizat@mail.kz',   120),
    ('bekzat', 'bekzat@mail.kz',  85),
    ('dariga', 'dariga@mail.kz',  200),
    ('nurlan', 'nurlan@mail.kz',  45),
    ('saule',  'saule@mail.kz',   310),
    ('arman',  'arman@mail.kz',   60),
    ('gulnaz', 'gulnaz@mail.kz',  175),
    ('timur',  'timur@mail.kz',   90),
    ('zarina', 'zarina@mail.kz',  250),
    ('dias',   'dias@mail.kz',    30),
]
students = []
for username, email, xp in students_data:
    u = User.objects.create_user(username, email, username)
    u.role = 'STUDENT'; u.xp = xp; u.save()
    students.append(u)

# ── 1-курс: Арифметика негіздері ────────────────────────────
print("Курс 1 жасалуда...")
c1 = Course.objects.create(
    title='Арифметика негіздері',
    description='Қосу, азайту, көбейту, бөлу — математика негіздері.',
    teacher=t1,
    is_published=True
)
c1.students.set(students[:7])

sec1 = Section.objects.create(course=c1, title='Қосу және азайту', order=1)
sec2 = Section.objects.create(course=c1, title='Көбейту кестесі', order=2)
sec3 = Section.objects.create(course=c1, title='Бөлу', order=3)

# Section 1 lessons
l1 = Lesson.objects.create(section=sec1, title='Натурал сандар', order=1)
Material.objects.create(lesson=l1, type='TEXT', title='Натурал сандар дегеніміз не?',
    content='Натурал сандар — бұл 1, 2, 3, 4, 5... деп есептелетін оң бүтін сандар. Олар заттарды санау үшін қолданылады.', order=1)
Material.objects.create(lesson=l1, type='VIDEO', title='Натурал сандар - видео',
    content='https://www.youtube.com/watch?v=dQw4w9WgXcQ', order=2)
Material.objects.create(lesson=l1, type='TEST', title='Білімді тексер',
    content='', order=3,
    data={'questions': [
        {'q': '5 + 3 = ?', 'a': '8', 'w1': '7', 'w2': '9', 'w3': '6', 'explanation': 'Бес пен үшті қоссақ сегіз болады.'},
        {'q': '10 - 4 = ?', 'a': '6', 'w1': '5', 'w2': '7', 'w3': '4', 'explanation': 'Оннан төртті алсақ алты болады.'},
        {'q': '7 + 8 = ?', 'a': '15', 'w1': '14', 'w2': '16', 'w3': '13', 'explanation': 'Жеті мен сегізді қоссақ он бес болады.'},
    ]})

l2 = Lesson.objects.create(section=sec1, title='Қосу ережесі', order=2)
Material.objects.create(lesson=l2, type='TEXT', title='Қосу ережесі',
    content='Қосу — екі санды біріктіру амалы. Мысалы: 3 + 4 = 7. Қосылғыштардың орнын ауыстырсақ да нәтиже өзгермейді: 3 + 4 = 4 + 3.', order=1)
Material.objects.create(lesson=l2, type='GAME', title='Жылдам есеп ойыны',
    content='fast-calc', order=2,
    data={'questions': [
        {'q': '2 + 3', 'a': '5', 'options': ['4', '5', '6', '7']},
        {'q': '6 + 4', 'a': '10', 'options': ['8', '9', '10', '11']},
        {'q': '9 + 1', 'a': '10', 'options': ['9', '10', '11', '12']},
    ]})

l3 = Lesson.objects.create(section=sec1, title='Азайту ережесі', order=3)
Material.objects.create(lesson=l3, type='TEXT', title='Азайту',
    content='Азайту — бір саннан екінші санды алу амалы. Нәтиже айырма деп аталады.', order=1)
Material.objects.create(lesson=l3, type='TEST', title='Тест',
    content='', order=2,
    data={'questions': [
        {'q': '9 - 5 = ?', 'a': '4', 'w1': '3', 'w2': '5', 'w3': '6', 'explanation': 'Тоғыздан бесті алсақ төрт болады.'},
        {'q': '15 - 7 = ?', 'a': '8', 'w1': '7', 'w2': '9', 'w3': '6', 'explanation': 'Он бестен жетіні алсақ сегіз болады.'},
    ]})

# Section 2 lessons
l4 = Lesson.objects.create(section=sec2, title='2-ге көбейту', order=1)
Material.objects.create(lesson=l4, type='TEXT', title='2-ге көбейту кестесі',
    content='2 × 1 = 2\n2 × 2 = 4\n2 × 3 = 6\n2 × 4 = 8\n2 × 5 = 10\n2 × 6 = 12\n2 × 7 = 14\n2 × 8 = 16\n2 × 9 = 18\n2 × 10 = 20', order=1)
Material.objects.create(lesson=l4, type='TEST', title='Тест',
    content='', order=2,
    data={'questions': [
        {'q': '2 × 5 = ?', 'a': '10', 'w1': '8', 'w2': '12', 'w3': '6', 'explanation': 'Екіні беске көбейтсек он болады.'},
        {'q': '2 × 7 = ?', 'a': '14', 'w1': '12', 'w2': '16', 'w3': '13', 'explanation': 'Екіні жетіге көбейтсек он төрт болады.'},
        {'q': '2 × 9 = ?', 'a': '18', 'w1': '16', 'w2': '20', 'w3': '17', 'explanation': 'Екіні тоғызға көбейтсек он сегіз болады.'},
    ]})

l5 = Lesson.objects.create(section=sec2, title='5-ке көбейту', order=2)
Material.objects.create(lesson=l5, type='TEXT', title='5-ке көбейту кестесі',
    content='5 × 1 = 5\n5 × 2 = 10\n5 × 3 = 15\n5 × 4 = 20\n5 × 5 = 25\n5 × 6 = 30\n5 × 7 = 35\n5 × 8 = 40\n5 × 9 = 45\n5 × 10 = 50', order=1)
Material.objects.create(lesson=l5, type='GAME', title='Рулетка ойыны',
    content='roulette', order=2,
    data={'questions': [
        {'q': '5 × 3 = ?', 'a': '15', 'options': ['10', '15', '20', '25']},
        {'q': '5 × 6 = ?', 'a': '30', 'options': ['25', '30', '35', '40']},
    ]})

# Section 3 lessons
l6 = Lesson.objects.create(section=sec3, title='Бөлу негіздері', order=1)
Material.objects.create(lesson=l6, type='TEXT', title='Бөлу дегеніміз не?',
    content='Бөлу — санды тең бөліктерге бөлу амалы. Мысалы: 10 ÷ 2 = 5. Яғни 10-ды 2-ге тең бөлсек, әр бөлікте 5 болады.', order=1)
Material.objects.create(lesson=l6, type='TEST', title='Тест',
    content='', order=2,
    data={'questions': [
        {'q': '10 ÷ 2 = ?', 'a': '5', 'w1': '4', 'w2': '6', 'w3': '3', 'explanation': 'Онды екіге бөлсек бес болады.'},
        {'q': '12 ÷ 3 = ?', 'a': '4', 'w1': '3', 'w2': '5', 'w3': '6', 'explanation': 'Он екіні үшке бөлсек төрт болады.'},
        {'q': '20 ÷ 4 = ?', 'a': '5', 'w1': '4', 'w2': '6', 'w3': '7', 'explanation': 'Жиырманы төртке бөлсек бес болады.'},
    ]})

# ── 2-курс: Геометрия негіздері ─────────────────────────────
print("Курс 2 жасалуда...")
c2 = Course.objects.create(
    title='Геометрия негіздері',
    description='Нүкте, түзу, пішіндер және олардың қасиеттері.',
    teacher=t1,
    is_published=True
)
c2.students.set(students[3:8])

sec4 = Section.objects.create(course=c2, title='Пішіндер', order=1)
sec5 = Section.objects.create(course=c2, title='Периметр және аудан', order=2)

l7 = Lesson.objects.create(section=sec4, title='Үшбұрыш', order=1)
Material.objects.create(lesson=l7, type='TEXT', title='Үшбұрыш туралы',
    content='Үшбұрыш — үш бұрышы және үш қабырғасы бар геометриялық пішін. Барлық бұрыштарының қосындысы 180° тең.', order=1)
Material.objects.create(lesson=l7, type='TEST', title='Тест',
    content='', order=2,
    data={'questions': [
        {'q': 'Үшбұрыштың барлық бұрыштарының қосындысы неге тең?', 'a': '180°', 'w1': '90°', 'w2': '360°', 'w3': '270°', 'explanation': 'Кез келген үшбұрыштың бұрыштарының қосындысы 180° тең.'},
        {'q': 'Үшбұрыштың неше қабырғасы бар?', 'a': '3', 'w1': '2', 'w2': '4', 'w3': '5', 'explanation': 'Үшбұрыштың 3 қабырғасы бар.'},
    ]})

l8 = Lesson.objects.create(section=sec4, title='Төртбұрыш', order=2)
Material.objects.create(lesson=l8, type='TEXT', title='Төртбұрыш туралы',
    content='Төртбұрыш — төрт бұрышы бар пішін. Барлық бұрыштарының қосындысы 360°. Шаршы, тіктөртбұрыш — төртбұрыштың түрлері.', order=1)
Material.objects.create(lesson=l8, type='GAME', title='Дұрыс/Бұрыс ойыны',
    content='true-false', order=2,
    data={'questions': [
        {'q': 'Шаршының барлық қабырғалары тең', 'a': True},
        {'q': 'Тіктөртбұрыштың барлық бұрыштары тең', 'a': True},
        {'q': 'Төртбұрыштың 5 қабырғасы бар', 'a': False},
    ]})

l9 = Lesson.objects.create(section=sec5, title='Периметр', order=1)
Material.objects.create(lesson=l9, type='TEXT', title='Периметр дегеніміз не?',
    content='Периметр — пішіннің барлық қабырғаларының ұзындықтары қосындысы. Шаршының периметрі: P = 4 × a. Тіктөртбұрыштың периметрі: P = 2 × (a + b).', order=1)
Material.objects.create(lesson=l9, type='TEST', title='Тест',
    content='', order=2,
    data={'questions': [
        {'q': 'Қабырғасы 5 см шаршының периметрі?', 'a': '20 см', 'w1': '10 см', 'w2': '15 см', 'w3': '25 см', 'explanation': 'P = 4 × 5 = 20 см'},
        {'q': 'a=6, b=4 тіктөртбұрыштың периметрі?', 'a': '20 см', 'w1': '24 см', 'w2': '10 см', 'w3': '12 см', 'explanation': 'P = 2 × (6 + 4) = 20 см'},
    ]})

# ── 3-курс: Алгебра кіріспе ─────────────────────────────────
print("Курс 3 жасалуда...")
c3 = Course.objects.create(
    title='Алгебра кіріспе',
    description='Теңдеулер, өрнектер және айнымалылар.',
    teacher=t2,
    is_published=True
)
c3.students.set(students[5:])

sec6 = Section.objects.create(course=c3, title='Өрнектер', order=1)

l10 = Lesson.objects.create(section=sec6, title='Айнымалы дегеніміз не?', order=1)
Material.objects.create(lesson=l10, type='TEXT', title='Айнымалы',
    content='Айнымалы — белгісіз санды білдіретін әріп. Мысалы: x + 5 = 10 теңдеуінде x — айнымалы. x = 5.', order=1)
Material.objects.create(lesson=l10, type='TEST', title='Тест',
    content='', order=2,
    data={'questions': [
        {'q': 'x + 3 = 7, x = ?', 'a': '4', 'w1': '3', 'w2': '5', 'w3': '10', 'explanation': 'x = 7 - 3 = 4'},
        {'q': '2x = 10, x = ?', 'a': '5', 'w1': '4', 'w2': '6', 'w3': '8', 'explanation': 'x = 10 ÷ 2 = 5'},
        {'q': 'x - 4 = 6, x = ?', 'a': '10', 'w1': '2', 'w2': '8', 'w3': '12', 'explanation': 'x = 6 + 4 = 10'},
    ]})

l11 = Lesson.objects.create(section=sec6, title='Теңдеу шешу', order=2)
Material.objects.create(lesson=l11, type='TEXT', title='Теңдеу шешу жолдары',
    content='Теңдеу шешу үшін айнымалыны жалғыз қалдыру керек. Ол үшін теңдіктің екі жағына бірдей амал жасаймыз.', order=1)
Material.objects.create(lesson=l11, type='GAME', title='Жылдам есеп',
    content='fast-calc', order=2,
    data={'questions': [
        {'q': 'x + 2 = 9, x = ?', 'a': '7', 'options': ['5', '6', '7', '8']},
        {'q': '3x = 15, x = ?', 'a': '5', 'options': ['3', '4', '5', '6']},
    ]})

print("\n✓ Дайын! Жасалды:")
print(f"  Мұғалімдер: teacher1 / teacher1,  teacher2 / teacher2")
print(f"  Оқушылар:   {', '.join([s.username for s in students])}")
print(f"  Курстар:    {Course.objects.count()} дана")
print(f"  Сабақтар:   {Lesson.objects.count()} дана")
print(f"  Материалдар: {Material.objects.count()} дана")
print(f"\nБарлық паролдар — username-мен бірдей (мысалы: aizat/aizat)")
