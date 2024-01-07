import json
from helpers.socket_manager import EventType, SocketConnectionManager
import re


async def handle_saved_chat_messages(websocket, id: int):
    from main import redis_manager
    redis_client = await redis_manager.initialize()
    manager = SocketConnectionManager()
    saved_chat_channel, = await redis_client.subscribe("saved_chat")
    try:
        async for message_bytes in saved_chat_channel.iter():
            message = json.loads(message_bytes)
            live_id = message.get('live_id')
            if live_id == int(id):
                user_msg = message.get('message')
                if user_msg == 'POLL':
                    await manager.send_message(websocket, message, event_type=EventType.POLL_INIT.value)
                if user_msg == 'RESULT':
                    await manager.send_message(websocket, message, event_type=EventType.RESULT_INIT.value)
                if user_msg != 'POLL' and user_msg != 'RESULT':
                    await manager.send_message(websocket, message, event_type=EventType.MESSAGE.value)

    except Exception as e:
        await redis_client.unsubscribe("live_chat")
        await redis_client.unsubscribe("saved_chat")
        print(f"Error in saved chat message handler: {e}")