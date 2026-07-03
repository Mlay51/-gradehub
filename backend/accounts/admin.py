from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Institution, Class, Student, Subject, Exam, Result
from .models import GradingScale, AuditLog


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_active']
    list_filter = ['role']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone')}),
    )


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at']
    search_fields = ['name']


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['name', 'institution', 'teacher']
    list_filter = ['institution']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'student_class', 'gender']
    list_filter = ['student_class', 'gender']
    search_fields = ['first_name', 'last_name']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'student_class', 'max_marks']
    list_filter = ['student_class']


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['name', 'student_class', 'date', 'created_by']
    list_filter = ['student_class']


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam', 'subject', 'marks']
    list_filter = ['exam', 'subject']

    
@admin.register(GradingScale)
class GradingScaleAdmin(admin.ModelAdmin):
    list_display = ['institution', 'grade', 'min_percentage', 'max_percentage', 'remarks']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'object_id', 'timestamp']
    readonly_fields = ['user', 'action', 'model_name', 'object_id', 'old_value', 'new_value', 'timestamp']