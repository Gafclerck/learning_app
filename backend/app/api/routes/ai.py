from app.api.deps import CurrentUser, SessionDep
from fastapi import HTTPException, status, APIRouter
from app.services.ai_service import get_recommendations, index_course

router = APIRouter()

@router.get("/recommendations")
def recommendations(*,limit : int  = 5,db : SessionDep,current_user : CurrentUser):
    """
    Retourne des cours recommandés basés sur le profil
    de l'utilisateur connecté.
    """
    return get_recommendations(db, current_user, limit)


@router.post("/index/course/{course_id}")
def index(course_id: int,db : SessionDep,current_user : CurrentUser):
    """
    Force la réindexation d'un cours.
    Utile si l'embedding est manquant.
    """
    result = index_course(db, course_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cours introuvable"
        )
    return {"message": "Cours indexé avec succès"}