from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from enum import Enum
import asyncio
import json
class EventType(Enum):
    MESSAGE = "message"
    PREVIOUS_CHAT = "previous_chat"
    ERROR = "error"
    POLL_INIT = "poll_init"
    RESULT_INIT = "result_init"
    ROOM_INFO = "room_info"

class SocketConnectionManager:
    def __init__(self):
        self.rooms: dict = {}
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, id: int):
        await websocket.accept()
        async with self.lock:
            if id in self.rooms:
                self.rooms[id].append(websocket)
            else:
                self.rooms[id] = [websocket]

    async def disconnect(self, id: int, websocket: WebSocket):
        async with self.lock:
            self.rooms[id].remove(websocket)
            if len(self.rooms[id]) == 0:
                del self.rooms[id]


    async def send_message(self, websocket: WebSocket, message=None, event_type=EventType.MESSAGE.value):
        # room_id = websocket.path_params['id']
        data_obj = {
                "type": event_type,
                "data": message,
            }
        await websocket.send_json(data_obj)


    async def broadcast(self, message, redis_pubsub, redis_manager):
        await redis_pubsub.publish_json("live_chat", message)
