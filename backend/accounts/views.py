from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Institution, Class, Student, Subject, Exam, Result
from .services import calculate_grades, log_audit
from .models import GradingScale, AuditLog
from .serializers import GradingScaleSerializer, AuditLogSerializer
from .serializers import (
    UserSerializer, RegisterSerializer, InstitutionSerializer,
    ClassSerializer, StudentSerializer, SubjectSerializer,
    ExamSerializer, ResultSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsAuthenticated]


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get', 'post'])
    def results(self, request, pk=None):
        exam = self.get_object()
        if request.method == 'GET':
            results = Result.objects.filter(exam=exam)
            return Response(ResultSerializer(results, many=True).data)
        elif request.method == 'POST':
            data = request.data.copy()
            data['exam'] = exam.id
            serializer = ResultSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    

class GradingScaleViewSet(viewsets.ModelViewSet):
    queryset = GradingScale.objects.all()
    serializer_class = GradingScaleSerializer
    permission_classes = [IsAuthenticated]


class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_exam_grades(request, exam_id):
    results = calculate_grades(exam_id)
    if not results:
        return Response({'error': 'Exam not found or no results'}, status=404)
    return Response([{
        'student': str(r['student']),
        'total': r['total'],
        'percentage': r['percentage'],
        'grade': r['grade'],
        'remarks': r['remarks'],
        'rank': i + 1,
    } for i, r in enumerate(results)])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enter_marks(request, exam_id):
    marks_data = request.data.get('marks', [])
    saved = []
    for item in marks_data:
        try:
            result, created = Result.objects.get_or_create(
                student_id=item['student_id'],
                exam_id=exam_id,
                subject_id=item['subject_id'],
            )
            old_marks = result.marks
            result.marks = item['marks']
            result.save()
            log_audit(
                user=request.user,
                action='UPDATE_MARKS' if not created else 'CREATE_MARKS',
                model_name='Result',
                object_id=result.id,
                old_value=old_marks,
                new_value=item['marks'],
            )
            saved.append(ResultSerializer(result).data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    calculate_grades(exam_id)
    return Response({'saved': len(saved), 'results': saved})