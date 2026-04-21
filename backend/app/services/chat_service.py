from sqlalchemy.orm import Session
from app.models.message import Message
from app.models.enrollment import Enrollment
from app.models.user import User

def get_room_id_for_course(course_id: int) -> str:
    """Generate the room ID for a course"""
    return f"course_{course_id}"

def get_room_id_for_private(user_id_1: int, user_id_2: int) -> str:
    """
    Generate a stable room ID for two users.
    The order doesn't matter — private_3_7 is always the same.
    """
    min_id = min(user_id_1, user_id_2)
    max_id = max(user_id_1, user_id_2)
    return f"private_{min_id}_{max_id}"


def can_access_course_room(db: Session, user: User, course_id: int) -> bool:
    """
    Check if a user can access the room of a course.
    Yes if: they are enrolled OR they are the course teacher.
    """
    from app.models.course import Course

    # Check if they are the teacher
    course = db.query(Course).filter(Course.id == course_id).first()
    if course and course.teacher_id == user.id:
        return True

    # Check if they are an enrolled student
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course_id
    ).first()
    return enrollment is not None


def save_message(
    db: Session,
    sender_id: int,
    room_id: str,
    content: str,
    file_url: str = None
) -> Message:
    """Save a message to the database"""
    message = Message(
        sender_id=sender_id,
        room_id=room_id,
        content=content,
        file_url=file_url
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_room_history(
    db: Session,
    room_id: str,
    limit: int = 50
) -> list[Message]:
    """
    Get the last messages of a room.
    Limited to 50 by default to avoid overloading.
    """
    return (
        db.query(Message)
        .filter(Message.room_id == room_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()[::-1]  # Reverse to get oldest first
    )