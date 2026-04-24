from fastapi import HTTPException, status, APIRouter

from app.models.user import User
from app.api.deps import SessionDep, CurrentUser, RequireAdmin
from app.schemas.user import AdminRegistrationRequest, UserResponse, UserUpdateRequest
from app.services.auth_service import register_user
from app.services.user_service import update_user, delete_user, toggle_user_active_status

router = APIRouter()

@router.delete("/me/delete")
def delete_account(user: CurrentUser, session: SessionDep):
    return delete_user(db=session, user_id=user.id)

@router.post("/private/create-account", response_model=UserResponse)
def create_account(user: RequireAdmin, session: SessionDep, new_user: AdminRegistrationRequest)-> UserResponse:
    return register_user(session, new_user)


@router.put("/private/{user_id}/update", response_model=UserResponse)
def update_account(user: RequireAdmin, session: SessionDep,user_id : int, user_data: UserUpdateRequest):
    return update_user(session, user_id, user_data)


@router.delete("/private/{user_id}/delete")
def delete_account(user: RequireAdmin, session: SessionDep,user_id : int):
    return delete_user(session, user_id)

@router.get("/private/all-users", response_model=list[UserResponse])
def get_all_users(user: RequireAdmin, session: SessionDep):
    return session.query(User).filter(User.id != user.id).all()

@router.get("/private/{user_id}/toggle-active", response_model=UserResponse)
def toggle_active_status(user: RequireAdmin, session: SessionDep, user_id: int):
    return toggle_user_active_status(session, user_id)