from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import RequireAdmin, RequireTeacher, SessionDep, CurrentUser
from app.models.user import User
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse, CourseDetailResponse,
    LessonCreate, LessonUpdate, LessonResponse
)
from app.services.course_service import (
    create_course, get_all_courses, get_course_by_id,
    update_course, delete_course,
    create_lesson, update_lesson, delete_lesson
)

router = APIRouter()

# courses routes ===========================================================

@router.get("", response_model=list[CourseResponse])
def list_courses(db : SessionDep):
    """Public — everyone can see published courses"""
    return get_all_courses(db)


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(course_id: int, db : SessionDep):
    """ course published with lessons details"""
    return get_course_by_id(db, course_id)


@router.post("", response_model=CourseResponse, status_code=201)
def create(
    data: CourseCreate,
    db : SessionDep,
    current_user: RequireTeacher
):
    """Reserved for teachers only"""
    return create_course(db, data, current_user)


@router.patch("/{course_id}", response_model=CourseResponse)
def update(
    course_id: int,
    data: CourseUpdate,
    db : SessionDep,
    current_user: RequireTeacher
):
    return update_course(db, course_id, data, current_user)


@router.delete("/{course_id}", status_code=204)
def delete(
    course_id: int,
    db : SessionDep,
    current_user: RequireTeacher
):
    delete_course(db, course_id, current_user)


# lessons routes ===========================================================

@router.post("/{course_id}/lessons", response_model=LessonResponse, status_code=201)
def add_lesson(
    course_id: int,
    data: LessonCreate,
    db : SessionDep,
    current_user: RequireTeacher
):
    return create_lesson(db, course_id, data, current_user)


@router.patch("/lessons/{lesson_id}", response_model=LessonResponse)
def edit_lesson(
    lesson_id: int,
    data: LessonUpdate,
    db : SessionDep,
    current_user: RequireTeacher
):
    return update_lesson(db, lesson_id, data, current_user)


@router.delete("/lessons/{lesson_id}", status_code=204)
def remove_lesson(
    lesson_id: int,
    db : SessionDep,
    current_user: RequireTeacher
):
    delete_lesson(db, lesson_id, current_user)