from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi_advanced_rate_limiter import SlidingWindowRateLimiter
from apps.db.redis_client import redis_client
from apps.auth.jwt import decode_token

limiter = SlidingWindowRateLimiter(
    capacity=20,
    fill_rate=20/60,
    scope="user",
    backend="redis",
    redis_client=redis_client
)

async def rate_limit_middleware(request: Request, call_next):
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    user_id = None
    if token:
        sub = decode_token(token)
        if sub:
            user_id = sub

    if not user_id:
        user_id = request.client.host

    if not limiter.allow_request(user_id):
        wait = limiter.get_wait_time(user_id)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {int(wait)}s."
        )

    return await call_next(request)