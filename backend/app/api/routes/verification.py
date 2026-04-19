from fastapi import Depends, HTTPException, status, APIRouter
from typing import Annotated
from datetime import timedelta, datetime, timezone

from app.schemas.user import VerifyCodeRequest
from app.core.config import settings
from app.models.user import User
from app.models.verification import Verification
from app.core.security import generate_code
from app.api.deps import SessionDep, CurrentUser

router = APIRouter()

@router.post("/send-code")
def send_code(user: CurrentUser, session: SessionDep):
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is already verified.",
        )
    older_code = session.query(Verification).filter(Verification.email == user.email).first()
    if older_code:
        session.delete(older_code)
        session.commit()
    code = generate_code()
    time_expires = timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)
    expiration_date = datetime.now(timezone.utc) + time_expires
    session.add(Verification(email=user.email, code=code, expiration_date=expiration_date))
    session.commit()
    return {"message":f"Verification code sent to {user.email}", "code": code, "status":status.HTTP_200_OK}


@router.post("/verify")
def verify(request: VerifyCodeRequest, session: SessionDep):
    #hmm there is a security problem here , another user can verify the account of another user if they have the email 
    user = session.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address.",
        )
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is already verified.",
        )
    code_entry = session.query(Verification).filter(Verification.email == request.email, Verification.code == request.code).first()
    if not code_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code or email.",
        )
    if datetime.now(timezone.utc) > code_entry.expiration_date:
        session.query(Verification).filter(Verification.email == request.email).delete()
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one.",
        )
    session.query(User).filter(User.email == request.email).update({"is_verified": True})
    session.query(Verification).filter(Verification.email == request.email).delete()
    session.commit()
    return {"message":"Your account is successfully verified", "status":status.HTTP_200_OK}