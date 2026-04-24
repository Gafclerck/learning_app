from pydantic import BaseModel, Field
from datetime import datetime
from app.models.teacher_request import RequestStatus
from app.schemas.user import UserResponse
from typing import Optional


class TeacherRequestCreate(BaseModel):
    motivation:      str = Field(..., min_length=20, max_length=1000)
    field:           str = Field(..., min_length=2, max_length=150)
    education_level: str = Field(..., min_length=2, max_length=100)


class TeacherRequestResponse(BaseModel):
    id:              int
    user_id:         int
    motivation:      str
    field:           str
    education_level: str
    status:          RequestStatus
    created_at:      datetime
    reviewed_at:     Optional[datetime]
    user:            UserResponse

    class Config:
        from_attributes = True
