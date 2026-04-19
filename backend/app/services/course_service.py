from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate, LessonCreate, LessonUpdate


#course services ===========================================================

def create_course(db: Session, data: CourseCreate, teacher: User) -> Course:
    course = Course(
        **data.model_dump(),
        teacher_id=teacher.id
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_all_courses(db: Session) -> list[Course]:
    """Return only published courses — visible to everyone"""
    return db.query(Course).filter(Course.is_published == True).all()


def get_course_by_id(db: Session, course_id: int) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return course


def update_course(db: Session, course_id: int, data: CourseUpdate, teacher: User) -> Course:
    course = get_course_by_id(db, course_id)

    if course.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this course"
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course


def delete_course(db: Session, course_id: int, teacher: User) -> None:
    course = get_course_by_id(db, course_id)

    if course.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this course"
        )

    db.delete(course)
    db.commit()


#lesson services ===========================================================

def create_lesson(db: Session, course_id: int, data: LessonCreate, teacher: User) -> Lesson:
    course = get_course_by_id(db, course_id)

    if course.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this course"
        )

    # Check that a lesson with the same order doesn't already exist
    existing = db.query(Lesson).filter(
        Lesson.course_id == course_id,
        Lesson.order == data.order
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A lesson with order {data.order} already exists in this course"
        )

    lesson = Lesson(**data.model_dump(), course_id=course_id)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def update_lesson(db: Session, lesson_id: int, data: LessonUpdate, teacher: User) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Check that the teacher is the owner of the parent course
    if lesson.course.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this course"
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)

    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson_id: int, teacher: User) -> None:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    if lesson.course.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this course"
        )

    db.delete(lesson)
    db.commit()