from fastapi import APIRouter

from app.api.routes import auth, users, verification, courses

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(verification.router, prefix="/verification", tags=["verification"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])