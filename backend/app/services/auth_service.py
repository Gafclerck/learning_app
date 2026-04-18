from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.models.user import User
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token, DUMPMY_HASH
from app.models.user import User
from app.schema.schema import RegistrationRequest
from app.core.config import settings

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        verify_password(password, DUMPMY_HASH)
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


def register_user(db: Session, user_in: RegistrationRequest) -> User:
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    hashed_password = hash_password(user_in.password)
    user = User(name=user_in.name, email=user_in.email, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, form_data : OAuth2PasswordRequestForm) -> str:
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Not Authenticated",
            headers={"WWW-Authenticate" : "Bearer"}
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
    )
    return access_token