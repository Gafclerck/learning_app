from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, Integer, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base
import enum

class CourseLevel(enum.Enum):
    beginner     = "beginner"
    intermediate = "intermediate"
    advanced     = "advanced"

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    level: Mapped[CourseLevel] = mapped_column(SAEnum(CourseLevel))
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    teacher: Mapped["User"] = relationship("User", back_populates="courses")
    lessons: Mapped[list["Lesson"]] = relationship("Lesson", back_populates="course", order_by="Lesson.order")
    enrollments: Mapped[list["Enrollment"]] = relationship("Enrollment", back_populates="course")
