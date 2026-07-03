from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='teacher')
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Institution(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Class(models.Model):
    name = models.CharField(max_length=100)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='classes')
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='classes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.institution.name}"

    class Meta:
        verbose_name_plural = "Classes"


class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='students')
    parent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')], blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='subjects')
    max_marks = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.name} - {self.student_class.name}"


class Exam(models.Model):
    name = models.CharField(max_length=200)
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='exams')
    date = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='exams')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.student_class.name}"


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='results')
    marks = models.FloatField(default=0)
    remarks = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ['student', 'exam', 'subject']

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.marks}"


class GradingScale(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='grading_scales')
    grade = models.CharField(max_length=5)
    min_percentage = models.FloatField()
    max_percentage = models.FloatField()
    remarks = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.grade} ({self.min_percentage}% - {self.max_percentage}%)"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=200)
    model_name = models.CharField(max_length=100)
    object_id = models.IntegerField()
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"
