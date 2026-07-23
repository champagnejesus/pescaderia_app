import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

try:
    import redis.asyncio as redis
except ImportError:
    redis = None

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 20, window_seconds: int = 60, redis_client: redis.Redis | None = None):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.redis_client = redis_client
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ("/api/v1/auth/login", "/api/v1/auth/register"):
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            window_start = now - self.window_seconds
            if self.redis_client is not None:
                key = f"ratelimit:{client_ip}"
                await self.redis_client.zadd(key, {str(now): now})
                await self.redis_client.zremrangebyscore(key, 0, window_start)
                count = await self.redis_client.zcard(key)
                await self.redis_client.expire(key, self.window_seconds)
                if count > self.max_requests:
                    raise HTTPException(status_code=429, detail="Too many requests. Try again later.")
            else:
                self.requests[client_ip] = [t for t in self.requests[client_ip] if t > window_start]
                if len(self.requests[client_ip]) >= self.max_requests:
                    raise HTTPException(status_code=429, detail="Too many requests. Try again later.")
                self.requests[client_ip].append(now)
        return await call_next(request)