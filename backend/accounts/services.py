from .models import Result, GradingScale, AuditLog, Exam


def get_grade(percentage, institution):
    scales = GradingScale.objects.filter(institution=institution).order_by('-min_percentage')
    for scale in scales:
        if percentage >= scale.min_percentage:
            return scale.grade, scale.remarks
    return 'F', 'Fail'


def calculate_grades(exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        institution = exam.student_class.institution
        students = exam.student_class.students.all()
        student_scores = []

        for student in students:
            results = Result.objects.filter(student=student, exam=exam)
            if not results.exists():
                continue
            total_marks = sum(r.marks for r in results)
            total_possible = sum(r.subject.max_marks for r in results)
            percentage = (total_marks / total_possible * 100) if total_possible > 0 else 0
            grade, remarks = get_grade(percentage, institution)
            student_scores.append({
                'student': student,
                'total': total_marks,
                'percentage': round(percentage, 2),
                'grade': grade,
                'remarks': remarks,
                'results': results,
            })

        student_scores.sort(key=lambda x: x['percentage'], reverse=True)

        for rank, score in enumerate(student_scores, start=1):
            for result in score['results']:
                result.remarks = f"Grade: {score['grade']} | Rank: {rank} | {score['remarks']}"
                result.save()

        return student_scores

    except Exam.DoesNotExist:
        return []


def log_audit(user, action, model_name, object_id, old_value='', new_value=''):
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        old_value=str(old_value),
        new_value=str(new_value),
    )
