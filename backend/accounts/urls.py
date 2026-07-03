from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'institutions', views.InstitutionViewSet)
router.register(r'classes', views.ClassViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'exams', views.ExamViewSet)
router.register(r'results', views.ResultViewSet)
router.register(r'grading-scales', views.GradingScaleViewSet)
router.register(r'audit-logs', views.AuditLogViewSet)

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/me/', views.me_view, name='me'),
    path('exams/<int:exam_id>/enter-marks/', views.enter_marks, name='enter-marks'),
    path('exams/<int:exam_id>/calculate-grades/', views.calculate_exam_grades, name='calculate-grades'),
    path('', include(router.urls)),
]
