from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Course, Section, Lesson, Material, LessonCompletion
from .serializers import (
    UserSerializer, CourseSerializer, SectionSerializer,
    LessonSerializer, MaterialSerializer, UserRegistrationSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD для курсов.
    - ADMIN видит все курсы.
    - TEACHER видит только свои курсы.
    - STUDENT видит только записанные курсы.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        """Фильтрует курсы по роли текущего пользователя."""
        user = self.request.user
        if user.role == 'ADMIN':
            return Course.objects.all()
        if user.role == 'TEACHER':
            return Course.objects.filter(teacher=user)
        return Course.objects.filter(students=user)

    def perform_create(self, serializer):
        """При создании курса автоматически назначает текущего пользователя учителем."""
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Возвращает статистику по каждому ученику курса:
        количество пройденных уроков, прогресс в % и XP.
        """
        course = self.get_object()
        lessons = Lesson.objects.filter(section__course=course)
        total_lessons = lessons.count()

        stats_data = []
        for student in course.students.all():
            completed_count = LessonCompletion.objects.filter(user=student, lesson__in=lessons).count()
            progress = (completed_count / total_lessons * 100) if total_lessons > 0 else 0
            stats_data.append({
                'id': student.id,
                'username': student.username,
                'email': student.email,
                'completed_lessons': completed_count,
                'total_lessons': total_lessons,
                'progress': round(progress, 1),
                'xp': student.xp
            })

        return Response(stats_data)

    @action(detail=True, methods=['post'])
    def enroll_students(self, request, pk=None):
        """
        Записывает учеников на курс по списку ID.
        Принимает: { "student_ids": [1, 2, 3] }
        Заменяет весь список учеников (set).
        """
        course = self.get_object()
        student_ids = request.data.get('student_ids', [])
        course.students.set(student_ids)
        return Response({'status': 'students enrolled'})

    @action(detail=False, methods=['get'])
    def general_stats(self, request):
        """
        Общая статистика для учителя/админа:
        - weekly_activity: количество завершений уроков за последние 7 дней
        - total_completions: всего завершений
        - popular_course: самый популярный курс по числу учеников
        """
        user = request.user
        if user.role != 'TEACHER' and user.role != 'ADMIN':
            return Response({'error': 'Рұқсат жоқ'}, status=403)

        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count

        # Активность за последние 7 дней
        last_7_days = []
        today = timezone.now().date()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = LessonCompletion.objects.filter(
                lesson__section__course__teacher=user,
                completed_at__date=day
            ).count()
            last_7_days.append({'day': day.strftime('%a'), 'val': count})

        # Всего завершений уроков в курсах этого учителя
        total_completions = LessonCompletion.objects.filter(
            lesson__section__course__teacher=user
        ).count()

        # Самый популярный курс (по количеству записанных учеников)
        popular_course = Course.objects.filter(teacher=user).annotate(
            student_count=Count('students')
        ).order_by('-student_count').first()

        return Response({
            'weekly_activity': last_7_days,
            'total_completions': total_completions,
            'popular_course': popular_course.title if popular_course else 'Жоқ'
        })


class SectionViewSet(viewsets.ModelViewSet):
    """CRUD для разделов курса."""
    queryset = Section.objects.all()
    serializer_class = SectionSerializer


class LessonViewSet(viewsets.ModelViewSet):
    """CRUD для уроков с дополнительным action для отметки прохождения."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Отмечает урок как пройденный текущим пользователем.
        При первом прохождении начисляет 10 XP.
        Повторное прохождение XP не даёт.
        """
        lesson = self.get_object()
        user = request.user
        completion, created = LessonCompletion.objects.get_or_create(user=user, lesson=lesson)

        if created:
            user.xp += 10
            user.save()
            return Response({'status': 'completed', 'xp_earned': 10})

        return Response({'status': 'already completed', 'xp_earned': 0})


class MaterialViewSet(viewsets.ModelViewSet):
    """CRUD для материалов урока (текст, видео, файл, игра, тест)."""
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD для пользователей.
    - Создание (регистрация) доступно всем без авторизации.
    - Остальные операции требуют авторизации.
    - ADMIN видит всех, TEACHER — только учеников, STUDENT — только себя.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """Регистрация открыта для всех. Остальные действия — только авторизованным."""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        """При регистрации используем сериализатор с паролем, иначе — стандартный."""
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    def get_queryset(self):
        """Фильтрует список пользователей по роли текущего пользователя."""
        user = self.request.user
        if user.role == 'ADMIN':
            return User.objects.all().order_by('-id')
        if user.role == 'TEACHER':
            return User.objects.filter(role='STUDENT').order_by('username')
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Возвращает данные текущего авторизованного пользователя."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_xp(self, request):
        """
        Начисляет XP текущему пользователю.
        Принимает: { "points": 10 }
        Возвращает новое значение XP.
        """
        user = request.user
        points = request.data.get('points', 0)
        try:
            points = int(points)
            if points > 0:
                user.xp += points
                user.save()
        except ValueError:
            pass
        return Response({'xp': user.xp})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reset_password(self, request, pk=None):
        """
        Сбрасывает пароль пользователя. Доступно только ADMIN.
        Принимает: { "password": "новый_пароль" }
        """
        if request.user.role != 'ADMIN':
            return Response({'error': 'Рұқсат жоқ'}, status=403)

        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password:
            return Response({'error': 'Пароль енгізілмеді'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'status': 'пароль өзгертілді'})

    def destroy(self, request, *args, **kwargs):
        """Удаление пользователя доступно только ADMIN."""
        if request.user.role != 'ADMIN':
            return Response({'error': 'Рұқсат жоқ'}, status=403)
        return super().destroy(request, *args, **kwargs)
