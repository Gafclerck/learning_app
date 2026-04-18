from fastapi import status, APIRouter

from app.models.user import User
from app.schema.schema import UserResponse
from app.api.deps import SessionDep, CurrentUser

router = APIRouter()

@router.delete("/delete-account")
def delete_account(user: CurrentUser, session: SessionDep):
    session.query(User).filter_by(email=user.email).delete()
    session.commit()
    return {"message":"Your account is successfully deleted", "status":status.HTTP_200_OK}