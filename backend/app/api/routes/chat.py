from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.core.websocket_manager import manager
from app.api.deps import CurrentUser, SessionDep
from app.services.auth_service import get_user_from_token
from app.services.chat_service import (
    get_room_id_for_course,
    get_room_id_for_private,
    can_access_course_room,
    save_message,
    get_room_history
)

router = APIRouter()


# == WebSocket — Course Chat ======================
@router.websocket("/ws/course/{course_id}")
async def course_chat(*,
    websocket: WebSocket,
    course_id: int,
    token: str = Query(...),  # JWT token passed as query param
    db: SessionDep
):
    """
    WebSocket for group chat of a course.
    Token is passed as query param because WebSockets
    do not support Authorization headers.
    """

    # Authenticate user via token
    try:
        user = get_user_from_token(db, token)
    except Exception:
        await websocket.close(code=1008)  # 1008 = Policy Violation
        return

    # Verify access to this room
    if not can_access_course_room(db, user, course_id):
        await websocket.close(code=1008)
        return

    room_id = get_room_id_for_course(course_id)

    # Connect user
    await manager.connect(websocket, room_id, user.id)

    # Notify other members
    await manager.send_to_room(room_id, {
        "type": "system",
        "content": f"{user.name} joined the chat"
    }, exclude_user_id=user.id)

    try:
        while True:
            # Wait for message from this user
            raw = await websocket.receive_text()
            data = json.loads(raw)
            content = data.get("content", "").strip()

            if not content:
                continue

            # Save to database
            message = save_message(db, user.id, room_id, content)

            # Build payload to send
            payload = {
                "type": "message",
                "id": message.id,
                "content": message.content,
                "sender_id": user.id,
                "sender_name": user.name,
                "created_at": message.created_at.isoformat(),
                "room_id": room_id
            }

            # Send to all in room including sender
            await manager.send_to_room(room_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(room_id, user.id)
        await manager.send_to_room(room_id, {
            "type": "system",
            "content": f"{user.name} left the chat"
        })


# PRIVATE CHAT

@router.websocket("/ws/private/{other_user_id}")
async def private_chat(*,
    websocket: WebSocket,
    other_user_id: int,
    token: str = Query(...),
    db: SessionDep
):
    """WebSocket for private chat between two users"""

    try:
        user = get_user_from_token(db, token)
    except Exception:
        await websocket.close(code=1008)
        return

    room_id = get_room_id_for_private(user.id, other_user_id)
    await manager.connect(websocket, room_id, user.id)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            content = data.get("content", "").strip()

            if not content:
                continue

            message = save_message(db, user.id, room_id, content)

            payload = {
                "type": "message",
                "id": message.id,
                "content": message.content,
                "sender_id": user.id,
                "sender_name": user.name,
                "created_at": message.created_at.isoformat(),
                "room_id": room_id
            }

            await manager.send_to_room(room_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(room_id, user.id)


#== REST Endpoints for Chat History ======================

@router.get("/history/course/{course_id}")
def course_history(
    course_id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    """Get the chat history of a course"""
    if not can_access_course_room(db, current_user, course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    room_id = get_room_id_for_course(course_id)
    messages = get_room_history(db, room_id)

    return [
        {
            "id": m.id,
            "content": m.content,
            "sender_id": m.sender_id,
            "sender_name": m.sender.name,
            "created_at": m.created_at.isoformat(),
            "room_id": m.room_id
        }
        for m in messages
    ]


@router.get("/history/private/{other_user_id}")
def private_history(
    other_user_id: int,
    db: SessionDep,
    current_user: CurrentUser
):
    """Get the history of a private conversation"""
    room_id = get_room_id_for_private(current_user.id, other_user_id)
    messages = get_room_history(db, room_id)

    return [
        {
            "id": m.id,
            "content": m.content,
            "sender_id": m.sender_id,
            "sender_name": m.sender.name,
            "created_at": m.created_at.isoformat(),
            "room_id": m.room_id
        }
        for m in messages
    ]