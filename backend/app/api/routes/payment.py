from fastapi import APIRouter, Request, Header
from app.api.deps import SessionDep, CurrentUser
from app.services.payment_service import create_checkout_session, handle_stripe_webhook

router = APIRouter()

@router.post("/checkout/{course_id}")
def checkout(
    course_id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    """Create a payment session for a course"""
    return create_checkout_session(db, course_id, current_user)


@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    db: SessionDep,
    stripe_signature: str = Header(None, alias="stripe-signature")
):
    """Endpoint to receive Stripe webhooks"""
    payload = await request.body()
    return handle_stripe_webhook(db, payload, stripe_signature)