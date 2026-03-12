
import json
import os
from upstash_redis import Redis

REDIS_URL = os.getenv("UPSTASH_REDIS_REST_URL")
REDIS_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")
REDIS_ENABLED = bool(REDIS_URL and REDIS_TOKEN)

# Initialize Upstash Redis client only if configured
redis = None
if REDIS_ENABLED:
    try:
        redis = Redis(url=REDIS_URL, token=REDIS_TOKEN)
        print("[Cache] Redis connected successfully")
    except Exception as e:
        print(f"[Cache] Redis initialization failed: {e}")
        REDIS_ENABLED = False
else:
    print("[Cache] Redis not configured - caching disabled")


def get_cached(key: str):
    if not REDIS_ENABLED or redis is None:
        return None
    
    try:
        value = redis.get(key)
        if value is None:
            return None
        return json.loads(value)

    except Exception as e:
        print(f"[Cache] Redis get error: {e}")
        return None


def set_cache(key: str, data, timeout: int = 60):
    if not REDIS_ENABLED or redis is None:
        return
    
    try:
        redis.setex(
            key,
            timeout,
            json.dumps(data)
        )
    except Exception as e:
        print(f"[Cache] Redis set error: {e}")


def clear_cache(key: str = None):
    if not REDIS_ENABLED or redis is None:
        return
    
    try:
        if key:
            redis.delete(key)
    except Exception as e:
        print(f"[Cache] Redis delete error: {e}")