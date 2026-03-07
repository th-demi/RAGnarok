import hashlib
import json
from apps.services.embedding_service import create_embeddings
from apps.db.redis_client import redis_client


def _cache_key(text: str) -> str:
    hash_val = hashlib.sha256(text.encode()).hexdigest()
    return f"embedding:{hash_val}"


async def get_cached_embedding(text: str):
    key = _cache_key(text)

    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)

    embedding = (await create_embeddings([text]))[0]

    redis_client.set(key, json.dumps(embedding), ex=86400)

    return embedding