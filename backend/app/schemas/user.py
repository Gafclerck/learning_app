from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.user import UserRole
from typing import Optional

class RegistrationRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class AdminRegistrationRequest(RegistrationRequest):
    role: UserRole

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  

class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., max_length=6, min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
