
import aioredis
from helpers.validate_chat_msg import validate_message_format
import json
from fastapi import WebSocketDisconnect
import asyncio
from aioredis import ConnectionForcedCloseError

from database import SessionLocal
from apps.chat.crud import ChatCrud
import os
from helpers.socket_manager import EventType
from dotenv import load_dotenv
import uuid
from helpers.chat_publisher import handle_saved_chat_messages
from helpers.poll_consumer import consume_redis_from_poll_channel

load_dotenv()

async def live_chat_viewset(websocket, id, user_id):
    from main import redis_manager, manager, chatConsumer, redis_client
    try:
        await manager.connect(websocket, id)

        chat_crud_obj = ChatCrud()

        previous_chat_data = chat_crud_obj.retrive_previous_chat(db=SessionLocal(), id=id)

        for i in previous_chat_data:
            data = {
                'live_id': i.live_id,
                'chat_id': i.id,
                'user_id': i.user_id,
                'user_name': i.user_name,
                'message': i.message,
            }
            if int(i.live_id) == int(id):
                await manager.send_message(websocket, data, event_type=EventType.PREVIOUS_CHAT.value)
            # await websocket.send_json(data)

        saved_chat_task = asyncio.create_task(handle_saved_chat_messages(websocket, id))
        chat_consumer_task = asyncio.create_task(chatConsumer(redis_manager))
        poll_task = asyncio.create_task(consume_redis_from_poll_channel())
        while True:
            try:
                data = await websocket.receive_json()
                if validate_message_format(data):
                    data['user_id'] = int(user_id)
                    data['live_id'] = int(id)
                    data['id'] = str(uuid.uuid4())
                    await manager.broadcast(data, redis_client, redis_manager)

                else:
                    response = {
                        "message": "Invalid JSON format",
                        "format": {
                            "live_id": "int",
                            "user_id": "int",
                            "user_name": "string",
                            "message": "string",
                            "extra_info": "if event type is POLL or RESULT then poll_id is required"
                        }
                    }
                    await manager.send_message(websocket, response, event_type=EventType.ERROR.value)

            except WebSocketDisconnect:
                saved_chat_task.cancel()
                chat_consumer_task.cancel()
                poll_task.cancel()
                await manager.disconnect(websocket=websocket, id=id)
                break

            except Exception as e:
                await manager.send_message(websocket, {"error": str(e), 'message': 'did you check your message type? need json format not string'}, event_type=EventType.ERROR.value)

    except Exception as e:
        await manager.send_message(websocket, {"error": str(e), 'message': 'did you check your message type? need json format not string'}, event_type=EventType.ERROR.value)
        await manager.disconnect(websocket=websocket, id=id)
