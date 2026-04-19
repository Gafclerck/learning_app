from fastapi import status, APIRouter

from app.models.user import User
from app.api.deps import SessionDep, CurrentUser, RequireAdmin
from app.schemas.user import AdminRegistrationRequest, UserResponse
from app.services.auth_service import register_user

router = APIRouter()

@router.delete("/delete-account")
def delete_account(user: CurrentUser, session: SessionDep):
    session.query(User).filter_by(email=user.email).delete()
    session.commit()
    return {"message":"Your account is successfully deleted", "status":status.HTTP_200_OK}


@router.post("/private/create-account")
def create_account(user: RequireAdmin, session: SessionDep, new_user: AdminRegistrationRequest)-> UserResponse:
    return register_user(session, new_user)