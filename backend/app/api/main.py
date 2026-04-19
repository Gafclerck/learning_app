from fastapi import APIRouter

from app.api.routes import auth, users, verification, courses, enrollment, payment

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(verification.router, prefix="/verification", tags=["verification"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(enrollment.router, prefix="/enrollments", tags=["enrollments"])
api_router.include_router(payment.router, prefix="/payments", tags=["payments"])