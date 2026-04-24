from fastapi import APIRouter
from typing import Optional

from app.api.deps import SessionDep, CurrentUser, RequireAdmin
from app.models.teacher_request import RequestStatus
from app.schemas.teacher_request import TeacherRequestCreate, TeacherRequestResponse
from app.services.teacher_request_service import (
    create_teacher_request,
    get_all_requests,
    get_my_request,
    approve_request,
    reject_request,
)

router = APIRouter()

# Étudiant soumet une demande
@router.post("", response_model=TeacherRequestResponse, status_code=201)
def submit_request(
    data: TeacherRequestCreate,
    db: SessionDep,
    current_user: CurrentUser,
):
    return create_teacher_request(db, current_user, data)


# Étudiant voit sa propre demande
@router.get("/my-request", response_model=TeacherRequestResponse | None)
def my_request(db: SessionDep, current_user: CurrentUser):
    return get_my_request(db, current_user.id)


# Admin — liste toutes les demandes, filtre optionnel par statut
# Exemple : GET /api/teacher-requests?status=pending
@router.get("", response_model=list[TeacherRequestResponse])
def list_requests(
    db: SessionDep,
    admin: RequireAdmin,
    status: Optional[RequestStatus] = None,
):
    return get_all_requests(db, status)


@router.patch("/{request_id}/approve", response_model=TeacherRequestResponse)
def approve(request_id: int, db: SessionDep, admin: RequireAdmin):
    return approve_request(db, request_id)

@router.patch("/{request_id}/reject", response_model=TeacherRequestResponse)
def reject(request_id: int, db: SessionDep, admin: RequireAdmin):
    return reject_request(db, request_id)
