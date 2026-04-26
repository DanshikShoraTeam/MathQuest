from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, SectionViewSet, LessonViewSet, 
    MaterialViewSet, UserViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
