from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, DateTime
from app.core.db import Base
from datetime import datetime

class Verification(Base):
    __tablename__ = "verifications_codes"
    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(Text, unique=True)
    code: Mapped[str] = mapped_column(String(6))
    expiration_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))