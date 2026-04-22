from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.core.base import Base


class CourseEmbedding(Base):
    __tablename__ = "course_embeddings"

    id        : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id : Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), unique=True, nullable=False)

    # 384 dimensions — taille du modèle all-MiniLM-L6-v2
    embedding : Mapped[list[float]] = mapped_column(Vector(384), nullable=False)

    course : Mapped["Course"] = relationship("Course")