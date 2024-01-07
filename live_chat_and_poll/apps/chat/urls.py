from fastapi import APIRouter, WebSocket
from .views import live_chat_viewset

chat = APIRouter(
    tags=["chat"],
)

@chat.websocket("/live_chat/{id}/{user_id}/")
async def websocket_endpoint(websocket: WebSocket, id:int, user_id:int):
    await live_chat_viewset(websocket=websocket, id=id, user_id=user_id)
