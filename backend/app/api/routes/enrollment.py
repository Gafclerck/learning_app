from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import RequireAdmin, RequireTeacher, SessionDep, CurrentUser
from app.models.user import User
from app.schemas.enrollment import EnrollmentResponse, CourseProgressResponse, MyEnrollmentResponse
from app.services.enrollment_service import (
    enroll_student,
    complete_lesson,
    get_course_progress,
    list_my_enrollments
)

router = APIRouter()

@router.post("/{course_id}/enroll", response_model=EnrollmentResponse, status_code=201)
def enroll(
    course_id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    return enroll_student(db, course_id, current_user)


@router.post("/{course_id}/lessons/{lesson_id}/complete")
def complete(
    course_id: int,
    lesson_id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    return complete_lesson(db, course_id, lesson_id, current_user)


@router.get("/{course_id}/progress", response_model=CourseProgressResponse)
def progress(
    course_id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    return get_course_progress(db, course_id, current_user)


@router.get("/my", response_model=list[MyEnrollmentResponse])
def my_enrollments(db: SessionDep, current_user: CurrentUser):
    return list_my_enrollments(db, current_user)