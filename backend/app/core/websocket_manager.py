from fastapi import WebSocket
from typing import Dict


class ConnectionManager:
    """
    Manages all active WebSocket connections.
    Lives in memory on the server.
    Internal structure:
    {
        "course_1": { user_id: websocket, ... },
        "private_3_7": { user_id: websocket, ... }
    }
    """

    def __init__(self):
        # Key: room_id (ex: "course_1", "private_3_7")
        # Value: dict of { user_id: WebSocket }
        self.rooms: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: int):
        """Accept the connection and add it to the room"""
        await websocket.accept()

        if room_id not in self.rooms:
            self.rooms[room_id] = {}

        self.rooms[room_id][user_id] = websocket
        print(f"User {user_id} connected to room {room_id}")

    def disconnect(self, room_id: str, user_id: int):
        """Remove the connection from the room"""
        if room_id in self.rooms:
            self.rooms[room_id].pop(user_id, None)

            # Remove room if it's empty
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        print(f"User {user_id} disconnected from room {room_id}")

    async def send_to_room(self, room_id: str, message: dict, exclude_user_id: int = None):
        """
        Send a message to all members of a room.
        exclude_user_id: do not send the message back to the sender
        """
        if room_id not in self.rooms:
            return

        import json
        disconnected = []

        for user_id, websocket in self.rooms[room_id].items():
            if exclude_user_id and user_id == exclude_user_id:
                continue
            try:
                await websocket.send_text(json.dumps(message))
            except Exception:
                # Connection is dead - mark it for removal
                disconnected.append(user_id)

        # Clean up dead connections
        for user_id in disconnected:
            self.disconnect(room_id, user_id)

    async def send_to_user(self, room_id: str, user_id: int, message: dict):
        """Send a message to a specific user in a room"""
        import json
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            try:
                await self.rooms[room_id][user_id].send_text(json.dumps(message))
            except Exception:
                self.disconnect(room_id, user_id)

    def get_room_members(self, room_id: str) -> list[int]:
        """Returns the list of user_ids connected in a room"""
        if room_id not in self.rooms:
            return []
        return list(self.rooms[room_id].keys())


# Unique shared instance across the entire application
# It's a singleton - only one instance exists
manager = ConnectionManager()