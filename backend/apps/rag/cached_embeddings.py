import hashlib
import json
from apps.rag.embeddings import create_embeddings
from apps.db.redis_client import redis_client


def _cache_key(text: str) -> str:
    hash_val = hashlib.sha256(text.encode()).hexdigest()
    return f"embedding:{hash_val}"


async def get_cached_embedding(text: str):
    key = _cache_key(text)

    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)

    # Not cached → call API
    embedding = (await create_embeddings([text]))[0]

    # Store in Redis (no expiry or set TTL if desired)
    redis_client.set(key, json.dumps(embedding))

    return embedding