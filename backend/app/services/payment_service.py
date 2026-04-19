import logging

import stripe
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.models.payment import Payment, PaymentStatus, PaymentProvider
from app.models.course import Course
from app.models.user import User
from app.services.enrollment_service import enroll_student

# Initialize Stripe SDK with secret key
stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(
    db: Session,
    course_id: int,
    student: User
) -> dict:
    """
    Create a Stripe payment session and return the checkout URL.
    """

    # Verify that the course exists and is published
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.is_published == True
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # If the course is free, enroll directly without payment
    if course.is_free:
        enrollment = enroll_student(db, course_id, student)
        return {
            "type": "free",
            "message": "Free enrollment successful",
            "enrollment": enrollment
        }

    # Create a payment with pending status in database
    payment = Payment(
        amount=float(course.price),
        status=PaymentStatus.pending,
        provider=PaymentProvider.stripe,
        user_id=student.id,
        course_id=course_id
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    try:
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(float(course.price) * 100),  # Stripe expects cents
                    "product_data": {
                        "name": course.title,
                        "description": course.description or ""
                    }
                },
                "quantity": 1
            }],
            mode="payment",

            # Redirect URLs after payment
            success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",

            # Metadata — store our IDs to retrieve them in webhook
            metadata={
                "payment_id": str(payment.id),
                "user_id": str(student.id),
                "course_id": str(course_id)
            }
        )

        # Save Stripe session ID in our payment
        payment.provider_payment_id = session.id
        db.commit()

        return {
            "type": "paid",
            "checkout_url": session.url
        }

    except stripe.error.StripeError as e:
        # If Stripe fails, mark payment as failed
        payment.status = PaymentStatus.failed
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe error: {str(e)}"
        )


def handle_stripe_webhook(db: Session, payload: bytes, sig_header: str) -> dict:
    """
    Process events sent by Stripe.
    Called when Stripe notifies your server that a payment has been processed.
    """
    try:
        # Verify that the request comes from Stripe
        # and not from an attacker trying to simulate a payment
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Payload invalide")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Signature invalide")

    # Process only the event we care about
    if event["type"] == "checkout.session.completed":
        event_dict = event.to_dict()
        session = event_dict["data"]["object"]
        metadata = session.get("metadata", {})

        payment_id = int(metadata.get("payment_id", 0))
        user_id    = int(metadata.get("user_id", 0))
        course_id  = int(metadata.get("course_id", 0))

        if not payment_id or not user_id or not course_id:
            return {"status": "ignored"}

        # Find the payment in database
        payment = db.query(Payment).filter(Payment.id == payment_id).first()

        if payment and payment.status == PaymentStatus.pending:
            from datetime import datetime, timezone
            # Mark payment as completed
            payment.status = PaymentStatus.completed
            payment.paid_at = datetime.now(timezone.utc)
            db.commit()
            # Create the enrollment
            student = payment.user
            enroll_student(db, course_id, student)

    return {"status": "ok"}