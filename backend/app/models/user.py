from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text
from core.db import Base

class User(Base):
    __tablename__ = "users"
    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(Text, unique=True)
    password: Mapped[str] = mapped_column(String(100))
    is_verified: Mapped[bool] = mapped_column(default=False)