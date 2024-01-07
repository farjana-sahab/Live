
import asyncio
from fastapi_cache import caches
from fastapi_cache.backends.redis import CACHE_KEY, RedisCacheBackend
import models
# from .cache import RedisCache
import aioredis
import json
from database import SessionLocal, engine
import os
from dotenv import load_dotenv
import re


class RedisConfig:
    def __init__(self):
        self.redis_url = os.environ.get("REDIS_URL")
        self.redis_password = os.environ.get("REDIS_PASSWORD")


    async def initialize(self):
        return await aioredis.create_redis_pool(
            f"{self.redis_url}", password=self.redis_password
        )

    async def mark_message_as_processed(self, message_id, redis_client):
        expiration_time = 3600
        await redis_client.setex(message_id, expiration_time, 'processed')

    async def redis_message_already_exist(self, message_id, redis_client):
        set_success = await redis_client.setnx(message_id, 1)
        if set_success:
            await redis_client.expire(message_id, 3600)
            return False
        else:
            return True
 