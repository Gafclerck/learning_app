from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, Generator
import jwt
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from core.config import settings
from sqlalchemy.orm import Session
from models.user import User
from core.db import session

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_STR}/auth/login"
)

def get_session() -> Generator[Session, None, None]:
    sessionlocal = session()
    try:
        yield sessionlocal
    finally:
        sessionlocal.close()
        sessionlocal.close()

def get_current_user(token: Annotated[str, Depends(reusable_oauth2)], session: Annotated[Session, Depends(get_session)]) -> User:
    credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except (InvalidTokenError, ValidationError):
        raise credentials_exception
    user = session.query(User).filter(User.email == username).first()
    if user is None:
        raise credentials_exception
    return user

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]
CurrentUser = Annotated[User, Depends(get_current_user)]