from fastapi_cache.backends.redis import CACHE_KEY, RedisCacheBackend
from fastapi import Depends
from fastapi_cache import caches
import json
from fastapi_cache import caches, close_caches


def redis_cache(self):
    return caches.get(CACHE_KEY)

class RedisCache:

    async def set_cache(self, key_name, data, cache: RedisCacheBackend, expiration_time=None):
        if expiration_time is not None:
            await cache.set(key_name, json.dumps(data), expire=expiration_time)
        else:
            await cache.set(key_name, json.dumps(data))

    async def get_cache(self, key_name, cache: RedisCacheBackend):
        cache_data = await cache.get(key_name)
        if not cache_data:
            return None
        json_data = json.loads(cache_data)
        return json_data
    async def delete_cache(self, key_name, cache: RedisCacheBackend):
        await cache.delete(key_name)

