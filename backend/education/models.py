from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('TEACHER', 'Мұғалім'),
        ('STUDENT', 'Оқушы'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - {self.title}"

class Material(models.Model):
    TYPE_CHOICES = (
        ('TEXT', 'Мәтін'),
        ('VIDEO', 'Видео'),
        ('FILE', 'Файл'),
        ('GAME', 'Ойын'),
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='materials')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    content = models.TextField(help_text="Мәтін мазмұны немесе видео/файл сілтемесі")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.lesson.title} - {self.get_type_display()}"
