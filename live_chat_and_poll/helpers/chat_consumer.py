
import asyncio
import models
# from .cache import RedisCache
import aioredis
import json
from database import SessionLocal
import os
from dotenv import load_dotenv

load_dotenv()

# cache_obj = RedisCache()

async def chatConsumer(redis_manager):
    from main import redis_client
    try:
        channel, = await redis_client.subscribe("live_chat")

        try:
            async for message_bytes in channel.iter():
                message_dict = json.loads(message_bytes)
                live_id = int(message_dict.get('live_id'))
                user_id = int(message_dict.get('user_id'))
                user_name = message_dict.get('user_name')
                message = message_dict.get('message')
                reply_for = message_dict.get('reply_for',  None)
                poll_id = message_dict.get('poll_id', None)
                message_id = message_dict.get('id')
                if await redis_manager.redis_message_already_exist(message_id, redis_client):
                    continue
                # Save into the database
                chat = models.LiveChat(live_id=live_id, user_id=user_id, message=message, user_name=user_name)

                with SessionLocal() as db:
                    try:
                        db.add(chat)
                        db.commit()
                        db.refresh(chat)
                        await redis_manager.mark_message_as_processed(message_id, redis_client)
                    except Exception as e:
                        print(f"Database Error: {e}")
                        db.rollback()
                    finally:
                        db.close()

                if reply_for:
                    replied_msg_obj = db.query(models.LiveChat.message).filter(models.LiveChat.id == reply_for).first()

                response = {
                    'chat_id': chat.id,
                    'user_name': chat.user_name if chat.user_name else None,
                    'live_id': live_id,
                    'user_id': user_id,
                    'message': message,
                }
                if reply_for:
                    response['reply_from'] = replied_msg_obj.message
                if poll_id:
                    response['poll_id'] = poll_id
                await redis_client.publish_json("saved_chat", response)
        except asyncio.CancelledError:
            await redis_client.unsubscribe("live_chat")
            await redis_client.unsubscribe("saved_chat")

        except Exception as e:
            print(e)

    except Exception as e:
        await redis_client.unsubscribe("live_chat")
        await redis_client.unsubscribe("saved_chat")
        print(f"Error in chatConsumer: {e}")