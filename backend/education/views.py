from rest_framework import viewsets, permissions
from .models import User, Course, Section, Lesson, Material
from .serializers import (
    UserSerializer, CourseSerializer, SectionSerializer, 
    LessonSerializer, MaterialSerializer
)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'TEACHER':
            return Course.objects.filter(teacher=user)
        return Course.objects.all() # Students can see all courses for now

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

from rest_framework.decorators import action
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
