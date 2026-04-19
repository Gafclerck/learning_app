from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
from app.core.config import settings
from app.core.base import Base


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


def init_db(session: Session):
    from app.schemas.user import AdminRegistrationRequest
    from app.models.user import UserRole
    from app.services.auth_service import register_user
    user_in = AdminRegistrationRequest(
        name="Admin",
        email=settings.FIRST_SUPERUSER,
        password=settings.FIRST_SUPERUSER_PASSWORD,
        role=UserRole.admin,
        is_active=True,
    )
    register_user(session, user_in)