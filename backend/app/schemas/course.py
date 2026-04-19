from pydantic import BaseModel, Field
from datetime import datetime
from app.models.course import CourseLevel
from typing import Optional


# ─── Schémas Lesson ─────────────────────────────────────────────────

class LessonCreate(BaseModel):
    title      : str           = Field(..., min_length=2, max_length=200)
    content    : Optional[str] = None
    order      : int           = Field(..., gt=0)
    duration   : Optional[int] = None
    is_preview : bool          = False


class LessonUpdate(BaseModel):
    title      : Optional[str] = None
    content    : Optional[str] = None
    order      : Optional[int] = None
    duration   : Optional[int] = None
    is_preview : Optional[bool] = None


class LessonResponse(BaseModel):
    id         : int
    title      : str
    content    : Optional[str]
    order      : int
    duration   : Optional[int]
    is_preview : bool
    course_id  : int
    created_at : datetime

    class Config:
        from_attributes = True


# ─── Schémas Course ─────────────────────────────────────────────────

class CourseCreate(BaseModel):
    title       : str            = Field(..., min_length=2, max_length=200)
    description : Optional[str] = None
    level       : CourseLevel
    price       : float          = Field(default=0.00, ge=0)
    is_free     : bool           = False


class CourseUpdate(BaseModel):
    title       : Optional[str]         = None
    description : Optional[str]        = None
    level       : Optional[CourseLevel] = None
    price       : Optional[float]       = None
    is_free     : Optional[bool]        = None
    is_published: Optional[bool]        = None


class CourseResponse(BaseModel):
    id          : int
    title       : str
    description : Optional[str]
    level       : CourseLevel
    price       : float
    is_free     : bool
    is_published: bool
    teacher_id  : int
    created_at  : datetime

    class Config:
        from_attributes = True


class CourseDetailResponse(CourseResponse):
    """
    Retourne le cours avec ses leçons.
    Utilisé uniquement sur GET /courses/{id}
    """
    lessons : list[LessonResponse] = []