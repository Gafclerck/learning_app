from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer)
    duration : Mapped[int] = mapped_column(Integer, nullable=True)  # Duration in minutes
    is_preview : Mapped[bool]= mapped_column(Boolean, default=False)
    created_at  : Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    course_id   : Mapped[int]      = mapped_column(Integer, ForeignKey("courses.id"))

    course      : Mapped["Course"] = relationship("Course", back_populates="lessons")