from rest_framework import serializers
from .models import User, Course, Section, Lesson, Material

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ('id', 'section', 'title', 'order', 'materials')

class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ('id', 'course', 'title', 'order', 'lessons')

class CourseSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'teacher', 'sections', 'created_at')
