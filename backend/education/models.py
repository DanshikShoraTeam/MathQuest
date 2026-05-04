from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Пользователь системы.
    Роли: TEACHER (учитель), STUDENT (ученик), ADMIN (администратор).
    Поле xp хранит накопленные очки опыта ученика.
    """
    ROLE_CHOICES = (
        ('TEACHER', 'Мұғалім'),
        ('STUDENT', 'Оқушы'),
        ('ADMIN', 'Админ'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    xp = models.PositiveIntegerField(default=0, help_text="Оқушының жинаған ұпайы")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Course(models.Model):
    """
    Учебный курс.
    Принадлежит учителю (teacher), к нему записываются ученики (students).
    """
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    students = models.ManyToManyField(User, related_name='enrolled_courses', blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Section(models.Model):
    """
    Раздел курса. Содержит уроки, сортируется по полю order.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """
    Урок внутри раздела. Содержит материалы (текст, видео, игры, тесты).
    Сортируется по полю order.
    """
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.title}"


class Material(models.Model):
    """
    Материал урока. Тип определяет формат:
    - TEXT: текстовый блок
    - VIDEO: ссылка на YouTube
    - FILE: загруженный файл
    - GAME: интерактивная игра (content = тип игры, data = вопросы)
    - TEST: обязательный тест (data = вопросы с вариантами)
    """
    TYPE_CHOICES = (
        ('TEXT', 'Мәтін'),
        ('VIDEO', 'Видео'),
        ('FILE', 'Файл'),
        ('GAME', 'Ойын (Optional)'),
        ('TEST', 'Тест (Mandatory)'),
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='materials', null=True, blank=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='thematic_tests', null=True, blank=True, help_text="Тақырыптық тест үшін")
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255, blank=True, null=True, help_text="Материал атауы")
    description = models.TextField(blank=True, null=True, help_text="Материал сипаттамасы")
    content = models.TextField(blank=True, help_text="Мәтін мазмұны / Видео сілтемесі / Ойын-Тест түрі")
    file_upload = models.FileField(upload_to='materials/', null=True, blank=True)
    data = models.JSONField(default=dict, blank=True, help_text="Сұрақтар мен түсіндірмелер (JSON)")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.lesson.title} - {self.get_type_display()}"


from django.conf import settings


class LessonCompletion(models.Model):
    """
    Запись о прохождении урока учеником.
    Создаётся один раз (unique_together). При создании ученику начисляется 10 XP.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='completed_lessons')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} completed {self.lesson.title}"
