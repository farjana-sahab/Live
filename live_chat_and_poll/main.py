import asyncio
from fastapi import FastAPI
from fastapi_cache.backends.redis import CACHE_KEY, RedisCacheBackend
from fastapi_cache import caches
from fastapi_cache import caches, close_caches
from helpers.socket_manager import SocketConnectionManager
import aioredis
from apps.poll.urls import poll
from apps.auth.urls import auth
import asyncio

from helpers.chat_consumer import chatConsumer
from apps.chat.urls import chat
import models
from database import engine
import os
from apps.live.urls import live
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from helpers.redis import RedisConfig

load_dotenv()

app = FastAPI()

models.Base.metadata.create_all(bind=engine)


manager = SocketConnectionManager()
redis_manager = RedisConfig()

@app.on_event("startup")
async def startup():
    global redis_client
    redis_client = await redis_manager.initialize()

# task1 = asyncio.create_task(redis_manager.consume_redis_from_poll_channel())
# task2 = asyncio.create_task(chatConsumer(redis_manager))

# asyncio.gather(task1, task2)

app.include_router(poll)
app.include_router(chat)
app.include_router(live)
app.include_router(auth)


origins = [
    "*",
    "http://localhost:3000",

    "http://20.197.72.188:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.on_event('startup')
# async def on_startup():
#     global redis_pubsub
#     redis_url = os.environ.get("REDIS_URL")
#     redis_password = os.environ.get("REDIS_PASSWORD")

#     redis_pubsub = await aioredis.create_redis_pool(f"{redis_url}", password=redis_password)



# @app.get("/room-info/{room_id}")
# async def get_room_info(room_id: int):
#     count = manager.get_room_count(room_id)
#     return {"room_id": room_id, "count": count}