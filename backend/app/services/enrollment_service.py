from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.enrollment import Enrollment, LessonProgress, EnrollmentStatus
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.user import User
from sqlalchemy.orm import joinedload


def enroll_student(db: Session, course_id: int, student: User) -> Enrollment:
    """
    Enrolls a student in a course and unlocks the first lesson.
    """
    # Check that the course exists and is published
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.is_published == True
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course unavailable or not published yet"
        )

    # Check that the student is not already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == student.id,
        Enrollment.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already enrolled in this course"
        )

    # Create the enrollment
    enrollment = Enrollment(
        user_id   = student.id,
        course_id = course_id
    )
    db.add(enrollment)
    db.flush()  # flush to get enrollment.id without committing yet

    # Get all lessons in the course sorted by order
    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).order_by(Lesson.order).all()

    # Create a LessonProgress for each lesson
    # Only the first lesson is unlocked
    for index, lesson in enumerate(lessons):
        progress = LessonProgress(
            enrollment_id=enrollment.id,
            lesson_id=lesson.id,
            is_unlocked=(index == 0),  # True only for the first
            is_completed=False
        )
        db.add(progress)

    db.commit()
    db.refresh(enrollment)
    return enrollment


def complete_lesson(
    db: Session,
    course_id: int,
    lesson_id: int,
    student: User
) -> LessonProgress:
    """
    Marks a lesson as completed and unlocks the next one.
    This is the core of the roadmap logic.
    """

    # Check that the student is enrolled in this course
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == student.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course"
        )

    # Get the progress for this lesson
    progress = db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found in your enrollment"
        )

    # Check that the lesson is unlocked
    if not progress.is_unlocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This lesson is locked. Please complete previous lessons first."
        )

    # Check that the lesson is not already completed
    if progress.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This lesson is already completed"
        )

    # Mark the lesson as completed
    progress.is_completed = True
    progress.completed_at = datetime.utcnow()

    # Find the current lesson to know its order
    current_lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id
    ).first()

    # Find the next lesson in this course
    next_lesson = db.query(Lesson).filter(
        Lesson.course_id == course_id,
        Lesson.order == current_lesson.order + 1
    ).first()

    if next_lesson:
        # Unlock the progress of the next lesson
        next_progress = db.query(LessonProgress).filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == next_lesson.id
        ).first()

        if next_progress:
            next_progress.is_unlocked = True
    else:
        # No next lesson - the course is complete
        enrollment.status = EnrollmentStatus.completed

    db.commit()
    db.refresh(progress)
    return progress


def get_course_progress(
    db: Session,
    course_id: int,
    student: User
) -> dict:
    """
    Returns the complete progress of a student in a course.
    """

    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id   == student.id,
        Enrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course"
        )

    # Get all lessons with their progress
    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).order_by(Lesson.order).all()

    total     = len(lessons)
    completed = 0
    roadmap   = []

    for lesson in lessons:
        progress = db.query(LessonProgress).filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.lesson_id == lesson.id
        ).first()

        if progress and progress.is_completed:
            completed += 1

        roadmap.append({
            "lesson_id": lesson.id,
            "title": lesson.title,
            "order": lesson.order,
            "is_unlocked": progress.is_unlocked if progress else False,
            "is_completed": progress.is_completed if progress else False,
            "completed_at": progress.completed_at if progress else None,
        })

    return {
        "course_id": course_id,
        "enrollment_status": enrollment.status.value,
        "total_lessons": total,
        "completed_lessons": completed,
        "percentage": round((completed / total) * 100) if total > 0 else 0,
        "roadmap": roadmap
    }


def list_my_enrollments(db: Session, student: User) -> list[dict]:
    """
    Lists all enrollments for the current student with a lightweight progress summary.
    """
    enrollments = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course))
        .filter(Enrollment.user_id == student.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )

    results: list[dict] = []
    for enrollment in enrollments:
        # Fetch progress rows with lesson order (for next lesson selection)
        rows = (
            db.query(LessonProgress, Lesson)
            .join(Lesson, Lesson.id == LessonProgress.lesson_id)
            .filter(LessonProgress.enrollment_id == enrollment.id)
            .order_by(Lesson.order.asc())
            .all()
        )

        total = len(rows)
        completed = sum(1 for (p, _lesson) in rows if p.is_completed)
        percentage = round((completed / total) * 100) if total > 0 else 0

        next_lesson_id = None
        for (p, lesson) in rows:
            if p.is_unlocked and not p.is_completed:
                next_lesson_id = lesson.id
                break

        course = enrollment.course
        results.append(
            {
                "enrollment_id": enrollment.id,
                "enrolled_at": enrollment.enrolled_at,
                "status": enrollment.status,
                "course": {
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "level": course.level.value if hasattr(course.level, "value") else str(course.level),
                    "price": float(course.price),
                    "is_free": course.is_free,
                    "is_published": course.is_published,
                    "teacher_id": course.teacher_id,
                },
                "total_lessons": total,
                "completed_lessons": completed,
                "percentage": percentage,
                "next_lesson_id": next_lesson_id,
            }
        )

    return results