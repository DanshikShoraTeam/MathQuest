from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Course, Section, Lesson, Material, LessonCompletion
from .serializers import (
    UserSerializer, CourseSerializer, SectionSerializer, 
    LessonSerializer, MaterialSerializer, UserRegistrationSerializer
)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Course.objects.all()
        if user.role == 'TEACHER':
            return Course.objects.filter(teacher=user)
        # Оқушылар тізімделген барлық курстарды көреді (жарияланбаса да)
        return Course.objects.filter(students=user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        course = self.get_object()
        # Get all lessons in this course
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
        course = self.get_object()
        student_ids = request.data.get('student_ids', [])
        course.students.set(student_ids)
        return Response({'status': 'students enrolled'})

    @action(detail=False, methods=['get'])
    def general_stats(self, request):
        user = request.user
        if user.role != 'TEACHER' and user.role != 'ADMIN':
            return Response({'error': 'Рұқсат жоқ'}, status=403)
            
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        from .models import LessonCompletion, Course
        
        # 1. Апталық белсенділік (соңғы 7 күн)
        last_7_days = []
        today = timezone.now().date()
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            # LessonCompletion моделінде 'completed_at' қолданылады
            count = LessonCompletion.objects.filter(
                lesson__section__course__teacher=user,
                completed_at__date=day
            ).count()
            last_7_days.append({
                'day': day.strftime('%a'),
                'val': count
            })
            
        # 2. Жалпы аяқталған сабақтар
        total_completions = LessonCompletion.objects.filter(
            lesson__section__course__teacher=user
        ).count()
        
        # 3. Ең танымал курс
        popular_course = Course.objects.filter(teacher=user).annotate(
            student_count=Count('students')
        ).order_by('-student_count').first()
        
        return Response({
            'weekly_activity': last_7_days,
            'total_completions': total_completions,
            'popular_course': popular_course.title if popular_course else 'Жоқ'
        })

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        user = request.user
        completion, created = LessonCompletion.objects.get_or_create(user=user, lesson=lesson)
        
        if created:
            user.xp += 10 # Әр сабақ үшін 10 ұпай
            user.save()
            return Response({'status': 'completed', 'xp_earned': 10})
            
        return Response({'status': 'already completed', 'xp_earned': 0})

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return User.objects.all().order_by('-id')
        if user.role == 'TEACHER':
            # Teachers can see all students to enroll them in courses
            return User.objects.filter(role='STUDENT').order_by('username')
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_xp(self, request):
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
        if request.user.role != 'ADMIN':
            return Response({'error': 'Рұқсат жоқ'}, status=403)
        return super().destroy(request, *args, **kwargs)
