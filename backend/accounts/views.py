from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Institution, Class, Student, Subject, Exam, Result
from .services import calculate_grades, log_audit, get_grade
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


from django.template.loader import render_to_string
from django.http import HttpResponse
from weasyprint import HTML
from datetime import date


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_report_card(request, student_id, exam_id):
    try:
        student = Student.objects.get(id=student_id)
        exam = Exam.objects.get(id=exam_id)
        results = Result.objects.filter(student=student, exam=exam)

        if not results.exists():
            return Response({'error': 'No results found'}, status=404)

        total_marks = sum(r.marks for r in results)
        total_possible = sum(r.subject.max_marks for r in results)
        percentage = round((total_marks / total_possible * 100), 2) if total_possible > 0 else 0

        institution = exam.student_class.institution
        grade, remarks = get_grade(percentage, institution)

        all_results = Result.objects.filter(exam=exam)
        student_totals = {}
        for r in all_results:
            sid = r.student.id
            if sid not in student_totals:
                student_totals[sid] = 0
            student_totals[sid] += r.marks

        sorted_students = sorted(student_totals.items(), key=lambda x: x[1], reverse=True)
        rank = next((i + 1 for i, (sid, _) in enumerate(sorted_students) if sid == student_id), 0)

        results_data = []
        for r in results:
            sub_percentage = round((r.marks / r.subject.max_marks * 100), 2) if r.subject.max_marks > 0 else 0
            sub_grade, _ = get_grade(sub_percentage, institution)
            results_data.append({
                'subject_name': r.subject.name,
                'marks': r.marks,
                'max_marks': r.subject.max_marks,
                'percentage': sub_percentage,
                'grade': sub_grade,
            })

        context = {
            'institution_name': institution.name,
            'exam_name': exam.name,
            'exam_date': exam.date,
            'student_name': f"{student.first_name} {student.last_name}",
            'class_name': exam.student_class.name,
            'gender': student.gender,
            'total_marks': total_marks,
            'total_possible': total_possible,
            'percentage': percentage,
            'overall_grade': grade,
            'rank': rank,
            'total_students': len(sorted_students),
            'results': results_data,
            'generated_date': date.today().strftime('%B %d, %Y'),
        }

        html_string = render_to_string('report_card.html', context)
        pdf_file = HTML(string=html_string).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="report_card_{student.first_name}_{student.last_name}.pdf"'
        return response

    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)
    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)



        from django.core.mail import send_mail
from django.conf import settings


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_report_cards(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        students = exam.student_class.students.all()
        emails_sent = 0
        errors = []

        for student in students:
            if not student.parent:
                continue
            parent = student.parent
            if not parent.email:
                continue

            results = Result.objects.filter(student=student, exam=exam)
            if not results.exists():
                continue

            total_marks = sum(r.marks for r in results)
            total_possible = sum(r.subject.max_marks for r in results)
            percentage = round((total_marks / total_possible * 100), 2) if total_possible > 0 else 0
            institution = exam.student_class.institution
            grade, remarks = get_grade(percentage, institution)

            all_results = Result.objects.filter(exam=exam)
            student_totals = {}
            for r in all_results:
                sid = r.student.id
                if sid not in student_totals:
                    student_totals[sid] = 0
                student_totals[sid] += r.marks
            sorted_students = sorted(student_totals.items(), key=lambda x: x[1], reverse=True)
            rank = next((i + 1 for i, (sid, _) in enumerate(sorted_students) if sid == student.id), 0)

            subject_results = "\n".join([
                f"  - {r.subject.name}: {r.marks}/{r.subject.max_marks}"
                for r in results
            ])

            message = f"""
Dear {parent.username},

We are pleased to inform you that the report card for {exam.name} has been published for your child.

Student: {student.first_name} {student.last_name}
Class: {exam.student_class.name}
Exam: {exam.name}

Results Summary:
{subject_results}

Total Marks: {total_marks}/{total_possible}
Percentage: {percentage}%
Overall Grade: {grade}
Class Rank: #{rank}
Remarks: {remarks}

Please login to GradeHub to download the full PDF report card.

Best regards,
{institution.name}
GradeHub System
            """

            try:
                send_mail(
                    subject=f"Report Card Published - {student.first_name} {student.last_name} - {exam.name}",
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[parent.email],
                    fail_silently=False,
                )
                emails_sent += 1
            except Exception as e:
                errors.append(str(e))

        return Response({
            'message': f'Report cards published! {emails_sent} email(s) sent successfully.',
            'emails_sent': emails_sent,
            'errors': errors
        })

    except Exam.DoesNotExist:
        return Response({'error': 'Exam not found'}, status=404)