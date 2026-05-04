from rest_framework import serializers
from .models import User, Course, Section, Lesson, Material


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя. Возвращает id, имя, email, роль и XP."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'xp')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Сериализатор регистрации нового пользователя.
    Пароль принимается только на запись (write_only), в ответе не возвращается.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')

    def create(self, validated_data):
        """Создаёт пользователя через create_user для правильного хэширования пароля."""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'STUDENT')
        )
        return user


class MaterialSerializer(serializers.ModelSerializer):
    """Сериализатор материала урока. Возвращает все поля, включая data (JSON с вопросами)."""
    class Meta:
        model = Material
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    """
    Сериализатор урока.
    Включает вложенный список материалов, флаг is_completed и ID курса.
    """
    materials = MaterialSerializer(many=True, read_only=True)
    is_completed = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(source='section.course_id', read_only=True)

    class Meta:
        model = Lesson
        fields = ('id', 'section', 'title', 'order', 'materials', 'is_completed', 'course_id')

    def get_is_completed(self, obj):
        """Проверяет, прошёл ли текущий авторизованный пользователь этот урок."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import LessonCompletion
            return LessonCompletion.objects.filter(user=request.user, lesson=obj).exists()
        return False


class SectionSerializer(serializers.ModelSerializer):
    """Сериализатор раздела. Включает вложенный список уроков."""
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ('id', 'course', 'title', 'order', 'lessons')


class CourseSerializer(serializers.ModelSerializer):
    """
    Сериализатор курса.
    Включает данные учителя, разделы с уроками и прогресс текущего ученика (в процентах).
    """
    teacher = UserSerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'teacher', 'sections', 'is_published', 'students', 'progress', 'created_at')

    def get_progress(self, obj):
        """
        Вычисляет процент выполненных уроков для текущего пользователя.
        Возвращает 0 если курс пустой или пользователь не авторизован.
        """
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
