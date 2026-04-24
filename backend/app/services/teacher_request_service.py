from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.teacher_request import TeacherRequest, RequestStatus
from app.models.user import User, UserRole
from app.schemas.teacher_request import TeacherRequestCreate


def create_teacher_request(db: Session, user: User, data: TeacherRequestCreate) -> TeacherRequest:
    existing = db.query(TeacherRequest).filter(
        TeacherRequest.user_id == user.id,
        TeacherRequest.status == RequestStatus.pending
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending teacher request"
        )

    if user.role in (UserRole.teacher, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cant not make this request"
        )

    request = TeacherRequest(
        user_id=user.id,
        motivation=data.motivation,
        field=data.field,
        education_level=data.education_level,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def get_all_requests(db: Session, status_filter: RequestStatus | None = None) -> list[TeacherRequest]:
    query = db.query(TeacherRequest)
    if status_filter:
        query = query.filter(TeacherRequest.status == status_filter)
    return query.order_by(TeacherRequest.created_at.desc()).all()


def get_my_request(db: Session, user_id: int) -> TeacherRequest | None:
    return db.query(TeacherRequest).filter(
        TeacherRequest.user_id == user_id
    ).order_by(TeacherRequest.created_at.desc()).first()


def approve_request(db: Session, request_id: int) -> TeacherRequest:
    request = db.query(TeacherRequest).filter(TeacherRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status != RequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request already processed")

    request.status = RequestStatus.approved
    request.reviewed_at = datetime.now(timezone.utc)

    user = db.query(User).filter(User.id == request.user_id).first()
    user.role = UserRole.teacher

    db.commit()
    db.refresh(request)
    return request


def reject_request(db: Session, request_id: int) -> TeacherRequest:
    request = db.query(TeacherRequest).filter(TeacherRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status != RequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request already processed")

    request.status = RequestStatus.rejected
    request.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(request)
    return request
