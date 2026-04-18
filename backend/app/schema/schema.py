from pydantic import BaseModel, EmailStr, Field

class RegistrationRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    name: str
    email: EmailStr
    is_verified: bool


class VerifyCodeRequest(BaseModel):
    email : EmailStr
    code : str = Field(..., max_length=6, min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
