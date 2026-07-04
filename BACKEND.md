# ⚙️ GradeHub Backend Documentation

## Overview
The GradeHub backend is built with Django and Django REST Framework, providing a secure and scalable REST API for managing student grades, exams, and report cards.

## 🛠️ Tech Stack
- **Django** — Python web framework
- **Django REST Framework** — REST API toolkit
- **SimpleJWT** — JWT authentication
- **django-cors-headers** — Cross Origin Resource Sharing
- **SQLite** — Development database
- **PostgreSQL** — Production database

## 📁 Project Structure## 🗄️ Database Models

### User
- Extended Django AbstractUser
- Added role field (admin, teacher, parent)
- Added phone field

### Institution
- School name, address, phone, email
- Created timestamp

### Class
- Name, institution, teacher
- Links to Institution and User

### Student
- First name, last name, gender
- Date of birth
- Links to Class and parent User

### Subject
- Name, max marks
- Links to Class

### Exam
- Name, date
- Links to Class and creator User

### Result
- Marks, remarks
- Links to Student, Exam, Subject
- Unique together constraint

### GradingScale
- Grade letter (A, B, C, D, F)
- Min and max percentage
- Remarks
- Links to Institution

### AuditLog
- Action, model name, object ID
- Old and new values
- Timestamp
- Links to User

## 🔐 Authentication
- JWT based authentication using SimpleJWT
- Access token lifetime: 12 hours
- Refresh token lifetime: 7 days
- All endpoints protected except login and register

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/login/ | Login user | No |
| POST | /api/auth/register/ | Register user | No |
| GET | /api/auth/me/ | Get current user | Yes |

### Institutions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/institutions/ | List all institutions |
| POST | /api/institutions/ | Create institution |
| GET | /api/institutions/:id/ | Get institution |
| PUT | /api/institutions/:id/ | Update institution |
| DELETE | /api/institutions/:id/ | Delete institution |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/classes/ | List all classes |
| POST | /api/classes/ | Create class |
| GET | /api/classes/:id/ | Get class |
| PUT | /api/classes/:id/ | Update class |
| DELETE | /api/classes/:id/ | Delete class |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students/ | List all students |
| POST | /api/students/ | Create student |
| GET | /api/students/:id/ | Get student |
| PUT | /api/students/:id/ | Update student |
| DELETE | /api/students/:id/ | Delete student |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/subjects/ | List all subjects |
| POST | /api/subjects/ | Create subject |
| GET | /api/subjects/:id/ | Get subject |
| PUT | /api/subjects/:id/ | Update subject |
| DELETE | /api/subjects/:id/ | Delete subject |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/exams/ | List all exams |
| POST | /api/exams/ | Create exam |
| GET | /api/exams/:id/ | Get exam |
| PUT | /api/exams/:id/ | Update exam |
| DELETE | /api/exams/:id/ | Delete exam |
| POST | /api/exams/:id/enter-marks/ | Enter student marks |
| POST | /api/exams/:id/calculate-grades/ | Calculate grades |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/results/ | List all results |
| POST | /api/results/ | Create result |
| GET | /api/results/:id/ | Get result |
| PUT | /api/results/:id/ | Update result |
| DELETE | /api/results/:id/ | Delete result |

### Grading Scales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/grading-scales/ | List grading scales |
| POST | /api/grading-scales/ | Create grading scale |

### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/audit-logs/ | List all audit logs |

## 🧮 Grade Calculation Logic
Located in `accounts/services.py`:

1. Fetch all results for the exam
2. Calculate total marks per student
3. Calculate percentage (total / max possible × 100)
4. Look up letter grade from GradingScale
5. Sort students by percentage (highest first)
6. Assign ranks (1st, 2nd, 3rd...)
7. Save remarks to each result
8. Log every mark change to AuditLog

## 🔒 Security Features
- JWT token authentication
- CORS protection
- Password hashing (Django built-in)
- Audit logging for all mark changes
- Permission classes on all endpoints

## 🚀 How to Run
```bash
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Server runs at: `http://127.0.0.1:8000`
Admin panel at: `http://127.0.0.1:8000/admin`
