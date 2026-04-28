from rest_framework import serializers
from .models import User, Course, Section, Lesson, Material

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'xp')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'STUDENT')
        )
        return user

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = ('id', 'section', 'title', 'order', 'materials', 'is_completed')

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import LessonCompletion
            return LessonCompletion.objects.filter(user=request.user, lesson=obj).exists()
        return False

class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ('id', 'course', 'title', 'order', 'lessons')

class CourseSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'teacher', 'sections', 'is_published', 'students', 'progress', 'created_at')

    def get_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        from .models import Lesson, LessonCompletion
        total_lessons = Lesson.objects.filter(section__course=obj).count()
        if total_lessons == 0:
            return 0
            
        completed_lessons = LessonCompletion.objects.filter(
            user=request.user, 
            lesson__section__course=obj
        ).count()
        
        return round((completed_lessons / total_lessons) * 100)
