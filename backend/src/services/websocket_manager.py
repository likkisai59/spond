import json
from typing import Dict, Set, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps user_id to a set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Maps conversation_id (room) to a set of active WebSockets
        self.room_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def connect_room(self, websocket: WebSocket, room_id: str):
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()
        self.room_connections[room_id].add(websocket)

    def disconnect_room(self, websocket: WebSocket, room_id: str):
        if room_id in self.room_connections:
            self.room_connections[room_id].discard(websocket)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    async def broadcast_to_room(self, message: dict, room_id: str):
        if room_id in self.room_connections:
            to_remove = set()
            for connection in self.room_connections[room_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    to_remove.add(connection)
            for connection in to_remove:
                self.disconnect_room(connection, room_id)

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            to_remove = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    to_remove.add(connection)
            for connection in to_remove:
                self.disconnect(connection, user_id)

    async def broadcast(self, message: dict):
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()
