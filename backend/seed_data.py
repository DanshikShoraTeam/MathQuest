"""
MathQuest — тестовые данные для демонстрации проекта.
Запуск: python seed_data.py  (из папки backend/)
Создаёт учителей, учеников, 3 курса с разделами, уроками и материалами.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from education.models import User, Course, Section, Lesson, Material

print("Очищаем старые тестовые данные...")
Material.objects.all().delete()
Lesson.objects.all().delete()
Section.objects.all().delete()
Course.objects.all().delete()
User.objects.filter(username__in=[
    'teacher1', 'teacher2',
    'aizat', 'bekzat', 'dariga', 'nurlan', 'saule',
    'arman', 'gulnaz', 'timur', 'zarina', 'dias'
]).delete()

# ── Учителя ──────────────────────────────────────────────────
print("Учителя создаются...")
t1 = User.objects.create_user('teacher1', 'teacher1@mathquest.kz', 'teacher1')
t1.role = 'TEACHER'; t1.save()

t2 = User.objects.create_user('teacher2', 'teacher2@mathquest.kz', 'teacher2')
t2.role = 'TEACHER'; t2.save()

# ── Ученики ──────────────────────────────────────────────────
print("Ученики создаются...")
students_data = [
    ('aizat',  'aizat@mail.kz',   120),
    ('bekzat', 'bekzat@mail.kz',   85),
    ('dariga', 'dariga@mail.kz',  200),
    ('nurlan', 'nurlan@mail.kz',   45),
    ('saule',  'saule@mail.kz',   310),
    ('arman',  'arman@mail.kz',    60),
    ('gulnaz', 'gulnaz@mail.kz',  175),
    ('timur',  'timur@mail.kz',    90),
    ('zarina', 'zarina@mail.kz',  250),
    ('dias',   'dias@mail.kz',     30),
]
students = []
for username, email, xp in students_data:
    u = User.objects.create_user(username, email, username)
    u.role = 'STUDENT'; u.xp = xp; u.save()
    students.append(u)

# ── Курс 1: Арифметика негіздері ─────────────────────────────
print("Курс 1 создаётся...")
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

# Раздел 1 — Сложение и вычитание
l1 = Lesson.objects.create(section=sec1, title='Натурал сандар', order=1)
Material.objects.create(lesson=l1, type='TEXT', title='Натурал сандар дегеніміз не?',
    content='Натурал сандар — бұл 1, 2, 3, 4, 5... деп есептелетін оң бүтін сандар. Олар заттарды санау үшін қолданылады.', order=1)
Material.objects.create(lesson=l1, type='VIDEO', title='Натурал сандар - видео',
    content='https://www.youtube.com/watch?v=dQw4w9WgXcQ', order=2)
Material.objects.create(lesson=l1, type='TEST', title='Білімді тексер', content='', order=3,
    data={'questions': [
        {'q': '500 + 300 = ?', 'a': '800', 'w1': '700', 'w2': '900', 'w3': '600', 'explanation': '500 + 300 = 800'},
        {'q': '1000 - 400 = ?', 'a': '600', 'w1': '500', 'w2': '700', 'w3': '400', 'explanation': '1000 - 400 = 600'},
        {'q': '7 × 8 = ?', 'a': '56', 'w1': '54', 'w2': '58', 'w3': '48', 'explanation': '7 × 8 = 56'},
    ]})

l2 = Lesson.objects.create(section=sec1, title='Үлкен сандарды қосу', order=2)
Material.objects.create(lesson=l2, type='TEXT', title='Үш таңбалы сандарды қосу',
    content='Үш таңбалы сандарды қосқанда санды разрядтарға бөліп қосамыз. Мысалы: 345 + 278 = 623.', order=1)
Material.objects.create(lesson=l2, type='GAME', title='Жылдам есеп ойыны', content='fast-calc', order=2,
    data={'questions': [
        {'q': '345 + 278 = ?', 'a': '623', 'w1': '613', 'w2': '633', 'w3': '523', 'explanation': '345 + 278 = 623'},
        {'q': '456 + 321 = ?', 'a': '777', 'w1': '767', 'w2': '787', 'w3': '677', 'explanation': '456 + 321 = 777'},
        {'q': '189 + 211 = ?', 'a': '400', 'w1': '390', 'w2': '410', 'w3': '300', 'explanation': '189 + 211 = 400'},
    ]})

l3 = Lesson.objects.create(section=sec1, title='Азайту', order=3)
Material.objects.create(lesson=l3, type='TEXT', title='Азайту',
    content='Азайту — бір саннан екінші санды алу амалы. Нәтиже айырма деп аталады.', order=1)
Material.objects.create(lesson=l3, type='TEST', title='Тест', content='', order=2,
    data={'questions': [
        {'q': '750 - 250 = ?', 'a': '500', 'w1': '450', 'w2': '550', 'w3': '600', 'explanation': '750 - 250 = 500'},
        {'q': '1000 - 375 = ?', 'a': '625', 'w1': '615', 'w2': '635', 'w3': '525', 'explanation': '1000 - 375 = 625'},
    ]})

# Раздел 2 — Таблица умножения
l4 = Lesson.objects.create(section=sec2, title='2-ге және 3-ке көбейту', order=1)
Material.objects.create(lesson=l4, type='TEXT', title='Көбейту кестесі',
    content='2 × 1 = 2\n2 × 2 = 4\n2 × 3 = 6\n...\n3 × 1 = 3\n3 × 2 = 6\n3 × 3 = 9', order=1)
Material.objects.create(lesson=l4, type='TEST', title='Тест', content='', order=2,
    data={'questions': [
        {'q': '2 × 5 = ?', 'a': '10', 'w1': '8', 'w2': '12', 'w3': '6', 'explanation': 'Екіні беске көбейтсек он болады.'},
        {'q': '3 × 7 = ?', 'a': '21', 'w1': '18', 'w2': '24', 'w3': '14', 'explanation': 'Үшті жетіге көбейтсек жиырма бір болады.'},
        {'q': '3 × 9 = ?', 'a': '27', 'w1': '24', 'w2': '30', 'w3': '18', 'explanation': 'Үшті тоғызға көбейтсек жиырма жеті болады.'},
    ]})

l5 = Lesson.objects.create(section=sec2, title='Шын/Жалған: Көбейту', order=2)
Material.objects.create(lesson=l5, type='TEXT', title='Көбейту кестесін тексер',
    content='Келесі ойында математикалық тұжырымдардың дұрыс немесе дұрыс еместігін анықтаңыз.', order=1)
Material.objects.create(lesson=l5, type='GAME', title='Шын/Жалған ойыны', content='true-false', order=2,
    data={'questions': [
        {'q': '5 × 6 = 30', 'a': 'True', 'w1': '', 'w2': '', 'w3': '', 'explanation': '5 × 6 = 30 — дұрыс'},
        {'q': '4 × 7 = 29', 'a': 'False', 'w1': '', 'w2': '', 'w3': '', 'explanation': '4 × 7 = 28, 29 емес'},
        {'q': '8 × 8 = 64', 'a': 'True', 'w1': '', 'w2': '', 'w3': '', 'explanation': '8 × 8 = 64 — дұрыс'},
    ]})

# Раздел 3 — Деление
l6 = Lesson.objects.create(section=sec3, title='Бөлу негіздері', order=1)
Material.objects.create(lesson=l6, type='TEXT', title='Бөлу дегеніміз не?',
    content='Бөлу — санды тең бөліктерге бөлу амалы. Мысалы: 10 ÷ 2 = 5. Яғни 10-ды 2-ге тең бөлсек, әр бөлікте 5 болады.', order=1)
Material.objects.create(lesson=l6, type='TEST', title='Тест', content='', order=2,
    data={'questions': [
        {'q': '100 ÷ 4 = ?', 'a': '25', 'w1': '20', 'w2': '30', 'w3': '15', 'explanation': '100 ÷ 4 = 25'},
        {'q': '72 ÷ 8 = ?', 'a': '9', 'w1': '8', 'w2': '10', 'w3': '7', 'explanation': '72 ÷ 8 = 9'},
        {'q': '120 ÷ 6 = ?', 'a': '20', 'w1': '18', 'w2': '22', 'w3': '15', 'explanation': '120 ÷ 6 = 20'},
    ]})

# ── Курс 2: Геометрия негіздері ──────────────────────────────
print("Курс 2 создаётся...")
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
Material.objects.create(lesson=l7, type='TEST', title='Тест', content='', order=2,
    data={'questions': [
        {'q': 'Үшбұрыштың барлық бұрыштарының қосындысы?', 'a': '180°', 'w1': '90°', 'w2': '360°', 'w3': '270°', 'explanation': 'Кез келген үшбұрыштың бұрыштарының қосындысы 180°.'},
        {'q': 'Үшбұрыштың неше қабырғасы бар?', 'a': '3', 'w1': '2', 'w2': '4', 'w3': '5', 'explanation': 'Үшбұрыштың 3 қабырғасы бар.'},
    ]})

l8 = Lesson.objects.create(section=sec4, title='Тіктөртбұрыш', order=2)
Material.objects.create(lesson=l8, type='TEXT', title='Тіктөртбұрыш туралы',
    content='Тіктөртбұрыш — төрт бұрышы бар пішін, барлық бұрыштары 90°. Периметрі: P = 2 × (a + b). Ауданы: S = a × b.', order=1)
Material.objects.create(lesson=l8, type='GAME', title='Тізбек ойыны', content='sequence', order=2,
    data={'questions': [
        {'q': '2, 4, 6, 8, ...', 'a': '10', 'w1': '9', 'w2': '11', 'w3': '12', 'explanation': 'Тізбек 2-ге артып жатыр. Келесі: 10.'},
        {'q': '5, 10, 15, 20, ...', 'a': '25', 'w1': '22', 'w2': '30', 'w3': '23', 'explanation': 'Тізбек 5-ке артып жатыр. Келесі: 25.'},
        {'q': '10, 20, 30, 40, ...', 'a': '50', 'w1': '45', 'w2': '55', 'w3': '42', 'explanation': 'Тізбек 10-ға артып жатыр. Келесі: 50.'},
    ]})

l9 = Lesson.objects.create(section=sec5, title='Периметр', order=1)
Material.objects.create(lesson=l9, type='TEXT', title='Периметр дегеніміз не?',
    content='Периметр — пішіннің барлық қабырғаларының ұзындықтары қосындысы. Шаршының периметрі: P = 4 × a. Тіктөртбұрыштың периметрі: P = 2 × (a + b).', order=1)
Material.objects.create(lesson=l9, type='TEST', title='Тест', content='', order=2,
    data={'questions': [
        {'q': 'Қабырғасы 5 см шаршының периметрі?', 'a': '20 см', 'w1': '10 см', 'w2': '15 см', 'w3': '25 см', 'explanation': 'P = 4 × 5 = 20 см'},
        {'q': 'a=6, b=4 тіктөртбұрыштың периметрі?', 'a': '20 см', 'w1': '24 см', 'w2': '10 см', 'w3': '12 см', 'explanation': 'P = 2 × (6 + 4) = 20 см'},
    ]})

l10 = Lesson.objects.create(section=sec5, title='Мәтіндік есептер', order=2)
Material.objects.create(lesson=l10, type='TEXT', title='Геометриялық есептер',
    content='Геометриялық есептерді шешу үшін формулаларды білу керек. Ауданы: S = a × b. Периметрі: P = 2(a + b).', order=1)
Material.objects.create(lesson=l10, type='GAME', title='Мәтіндік есеп ойыны', content='text-task', order=2,
    data={'questions': [
        {'q': 'Тіктөртбұрышты бақшаның ұзындығы 25 м, ені 16 м. Периметрі қанша?', 'a': '82', 'w1': '400', 'w2': '41', 'w3': '84', 'explanation': 'P = 2 × (25 + 16) = 2 × 41 = 82 м', 'steps': ['P = 2 × (ұзындық + ен)', 'P = 2 × (25 + 16) = 82 м']},
        {'q': 'Шаршы бөлменің ені 6 м. Ауданы қанша м²?', 'a': '36', 'w1': '24', 'w2': '12', 'w3': '30', 'explanation': 'S = 6 × 6 = 36 м²', 'steps': ['S = a²', 'S = 6² = 36 м²']},
    ]})

# ── Курс 3: 5-класс: Жай бөлшектер мен пайыздар ─────────────
print("Курс 3 создаётся...")
c3 = Course.objects.create(
    title='5-сынып: Жай бөлшектер',
    description='Жай бөлшектер, ондық бөлшектер, пайыздар — 5-сынып бағдарламасы.',
    teacher=t2,
    is_published=True
)
c3.students.set(students[5:])

sec6 = Section.objects.create(course=c3, title='Жай бөлшектер', order=1)
sec7 = Section.objects.create(course=c3, title='Пайыздар', order=2)

l11 = Lesson.objects.create(section=sec6, title='Бөлшек дегеніміз не?', order=1)
Material.objects.create(lesson=l11, type='TEXT', title='Жай бөлшек',
    content='Жай бөлшек — бөлінгіш / бөлгіш түрінде жазылатын сан. Мысалы: 3/4 — үштің төртінші бөлігі. Алымы — жоғарғы, бөлімі — төменгі сан.', order=1)
Material.objects.create(lesson=l11, type='GAME', title='Бос орын: Бөлшектер', content='fill-blank', order=2,
    data={'questions': [
        {'q': '1/2 + 1/2 = ?', 'a': '1', 'explanation': '1/2 + 1/2 = 2/2 = 1'},
        {'q': '3/4 - 1/4 = ?', 'a': '2/4', 'explanation': '3/4 - 1/4 = 2/4'},
        {'q': '5/6 - 1/6 = ?', 'a': '4/6', 'explanation': '5/6 - 1/6 = 4/6'},
    ]})

l12 = Lesson.objects.create(section=sec6, title='Бөлшектерді қосу', order=2)
Material.objects.create(lesson=l12, type='TEXT', title='Бөлшектерді қосу',
    content='Бөлімдері бірдей бөлшектерді қосқанда алымдарын қосамыз, бөлімін өзгертпейміз. 1/4 + 2/4 = 3/4.', order=1)
Material.objects.create(lesson=l12, type='TEST', title='Тест', content='', order=2,
    data={'questions': [
        {'q': '1/5 + 2/5 = ?', 'a': '3/5', 'w1': '3/10', 'w2': '2/5', 'w3': '4/5', 'explanation': '1/5 + 2/5 = 3/5'},
        {'q': '3/8 + 1/8 = ?', 'a': '4/8', 'w1': '4/16', 'w2': '3/8', 'w3': '5/8', 'explanation': '3/8 + 1/8 = 4/8'},
        {'q': '5/9 - 2/9 = ?', 'a': '3/9', 'w1': '7/9', 'w2': '2/9', 'w3': '4/9', 'explanation': '5/9 - 2/9 = 3/9'},
    ]})

l13 = Lesson.objects.create(section=sec7, title='Пайыз дегеніміз не?', order=1)
Material.objects.create(lesson=l13, type='TEXT', title='Пайыз',
    content='Пайыз (%) — санның жүзден бір бөлігі. 1% = 1/100. Мысалы: 200-дың 50%-і = 200 × 50/100 = 100.', order=1)
Material.objects.create(lesson=l13, type='GAME', title='Жылдам есеп: Пайыздар', content='fast-calc', order=2,
    data={'questions': [
        {'q': '200-нің 50%-і қанша?', 'a': '100', 'w1': '50', 'w2': '150', 'w3': '200', 'explanation': '200 × 50/100 = 100'},
        {'q': '500-дің 20%-і қанша?', 'a': '100', 'w1': '50', 'w2': '200', 'w3': '25', 'explanation': '500 × 20/100 = 100'},
        {'q': '1000-ның 10%-і қанша?', 'a': '100', 'w1': '10', 'w2': '110', 'w3': '1000', 'explanation': '1000 × 10/100 = 100'},
    ]})

l14 = Lesson.objects.create(section=sec7, title='Пайыздық мәтіндік есептер', order=2)
Material.objects.create(lesson=l14, type='TEXT', title='Пайыздық есептер',
    content='Пайыздық есептерде берілген санның пайызын есептейміз. Формула: Нәтиже = Сан × Пайыз / 100.', order=1)
Material.objects.create(lesson=l14, type='GAME', title='Мәтіндік есеп: Пайыздар', content='text-task', order=2,
    data={'questions': [
        {'q': 'Дүкенде 15 000 теңгелік тауардың бағасы 20%-ке түсті. Жаңа бағасы қанша?', 'a': '12000', 'w1': '3000', 'w2': '18000', 'w3': '13000', 'explanation': 'Жеңілдік = 15000 × 20% = 3000. Жаңа баға = 15000 - 3000 = 12000', 'steps': ['Жеңілдік = 15 000 × 20% = 3 000 теңге', 'Жаңа баға = 15 000 − 3 000 = 12 000 теңге']},
        {'q': '60 оқушының 25%-і спорт секциясына барады. Нешеуі барады?', 'a': '15', 'w1': '20', 'w2': '25', 'w3': '10', 'explanation': '60 × 25/100 = 15 оқушы', 'steps': ['60 × 25 / 100 = 15 оқушы']},
    ]})

print("\n✓ Дайын! Жасалды:")
print(f"  Мұғалімдер:  teacher1 / teacher1  |  teacher2 / teacher2")
print(f"  Оқушылар:    {', '.join([s.username for s in students])}")
print(f"  Курстар:     {Course.objects.count()} дана")
print(f"  Сабақтар:    {Lesson.objects.count()} дана")
print(f"  Материалдар: {Material.objects.count()} дана")
print(f"\nБарлық паролдар — username-мен бірдей (мысалы: aizat / aizat)")
