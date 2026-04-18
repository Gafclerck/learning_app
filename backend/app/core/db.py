import os
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

session = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

class Base(DeclarativeBase):
    pass


def init_db():
    import app.models.user
    import app.models.verification
    Base.metadata.create_all(bind=engine)


class Base(DeclarativeBase):
    pass


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
