from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from fastapi import status

from app.schemas.user import UserUpdateRequest

def update_user(db: Session, user_id: int, data: UserUpdateRequest) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> None:
    target_user = db.query(User).filter_by(id=user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db.query(User).filter_by(id=user_id).delete()
    db.commit()
    return {"message":"User account is successfully deleted", "status":status.HTTP_200_OK}


def toggle_user_active_status(db: Session, user_id: int) -> User:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db_user.is_active = not db_user.is_active
    db.commit()
    db.refresh(db_user)
    return db_user