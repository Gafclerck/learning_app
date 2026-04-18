from fastapi import Depends, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from app.schema.user import RegistrationRequest, Token, UserResponse
from app.api.deps import SessionDep, CurrentUser
from app.services.auth_service import register_user, login_user

router = APIRouter()

@router.post("/register")
def register(user: RegistrationRequest, db: SessionDep)->UserResponse:
    return register_user(db, user)


@router.post("/login")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: SessionDep)-> Token:
    access_token = login_user(db, form_data)
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me")
def get_user(user: CurrentUser):
    return UserResponse(name=user.name, email=user.email, is_verified=user.is_verified)
