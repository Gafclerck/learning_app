from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Annotated
from models.user import User
from schema import RegistrationRequest, Token
from core.config import settings
from core.security import create_access_token, hash_password, authenticate_user
from api.deps import SessionDep


router = APIRouter()

@router.post("/register")
def register(user: RegistrationRequest, db: SessionDep):
    hashed_password = hash_password(user.password)
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    db.add(User(name=user.name, email=user.email, password=hashed_password))
    db.commit()
    return {"message":"Successfully registered", "status":status.HTTP_201_CREATED}


@router.post("/login")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: SessionDep):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Not Authenticated",
            headers={"WWW-Authenticate" : "Bearer"}
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")