from datetime import datetime
from sqlalchemy import Integer, DateTime, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base
import enum

from app.models.user import User


class EnrollmentStatus(enum.Enum):
    active    = "active"
    completed = "completed"
    cancelled = "cancelled"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[EnrollmentStatus] = mapped_column(SAEnum(EnrollmentStatus), default=EnrollmentStatus.active)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"))

    # Relations
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
    progress: Mapped[list["LessonProgress"]] = relationship("LessonProgress", back_populates="enrollment")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"))
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"))

    # Relations
    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="progress")
    lesson: Mapped["Lesson"] = relationship("Lesson")