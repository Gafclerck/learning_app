import os
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from pathlib import Path

INSTANCE_DIR = Path(__file__).parent.parent.parent / "instance"
DATABASE_FILE = INSTANCE_DIR / "app.db"

os.makedirs(INSTANCE_DIR, exist_ok=True)
engine = create_engine(f"sqlite:///{DATABASE_FILE.as_posix()}", connect_args={"check_same_thread": False})
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db():
    import models.user
    import models.verification
    Base.metadata.create_all(bind=engine)


# engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
# def init_db(session: Session) -> None:
#     # Tables should be created with Alembic migrations
#     # But if you don't want to use migrations, create
#     # the tables un-commenting the next lines
#     # from sqlmodel import SQLModel

#     # This works because the models are already imported and registered from app.models
#     # SQLModel.metadata.create_all(engine)

#     user = session.exec(
#         select(User).where(User.email == settings.FIRST_SUPERUSER)
#     ).first()
#     if not user:
#         user_in = UserCreate(
#             email=settings.FIRST_SUPERUSER,
#             password=settings.FIRST_SUPERUSER_PASSWORD,
#             is_superuser=True,
#         )
#         user = crud.create_user(session=session, user_create=user_in)
