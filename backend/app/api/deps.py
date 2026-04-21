from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, Generator
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User, UserRole
from app.core.db import session
from app.services.auth_service import get_user_from_token

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_STR}/auth/login"
)

def get_session() -> Generator[Session, None, None]:
    sessionlocal = session()
    try:
        yield sessionlocal
    finally:
        sessionlocal.close()

def get_current_user(token: Annotated[str, Depends(reusable_oauth2)], session: Annotated[Session, Depends(get_session)]) -> User:
    credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user_from_token(session, token)
    if not user:
        raise credentials_exception
    return user

def require_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access reserved for teachers"
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access reserved for admins"
        )
    return current_user

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]
CurrentUser = Annotated[User, Depends(get_current_user)]
RequireTeacher = Annotated[User, Depends(require_teacher)]
RequireAdmin = Annotated[User, Depends(require_admin)]