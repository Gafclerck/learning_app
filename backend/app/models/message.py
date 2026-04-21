from datetime import datetime, timezone
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    content: Mapped[str] = mapped_column(Text)
    file_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    # The sender
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    # The room - can be "course_1" or "private_3_7"
    # We only store the room ID as a string
    room_id: Mapped[str] = mapped_column(String(100), index=True)

    # Relationship
    sender: Mapped["User"] = relationship("User")