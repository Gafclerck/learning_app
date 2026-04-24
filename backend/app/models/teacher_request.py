import enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Enum as SAEnum, DateTime, ForeignKey
from app.core.base import Base
from datetime import datetime, timezone


class RequestStatus(enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class TeacherRequest(Base):
    __tablename__ = "teacher_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    motivation:      Mapped[str] = mapped_column(Text, nullable=False)
    field:           Mapped[str] = mapped_column(String(150), nullable=False) 
    education_level: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[RequestStatus] = mapped_column(
        SAEnum(RequestStatus), default=RequestStatus.pending
    )
    created_at:  Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=None)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
