from pydantic import BaseModel
from datetime import datetime
from app.models.enrollment import EnrollmentStatus


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: EnrollmentStatus
    enrolled_at: datetime

    class Config:
        from_attributes = True


class LessonProgressResponse(BaseModel):
    lesson_id: int
    title: str
    order: int
    is_unlocked: bool
    is_completed: bool
    completed_at: datetime | None

    class Config:
        from_attributes = True


class CourseProgressResponse(BaseModel):
    course_id: int
    enrollment_status: str
    total_lessons: int
    completed_lessons: int
    percentage: int
    roadmap: list[LessonProgressResponse]