import enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Boolean, Enum as SAEnum, DateTime
from app.core.base import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship

class UserRole(enum.Enum):
    student = "student"
    teacher = "teacher"
    admin   = "admin"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.student)
    password_hash: Mapped[str] = mapped_column(Text)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    # teacher has courses
    courses: Mapped[list["Course"]] = relationship("Course", back_populates="teacher")
    # student has enrollements
    enrollments: Mapped[list["Enrollment"]] = relationship("Enrollment", back_populates="user")