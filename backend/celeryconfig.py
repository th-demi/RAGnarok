from celery import Celery
import os

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = os.getenv("REDIS_PORT", 6379)

celery_app = Celery(
    "backend.tasks.workers",
    broker=f"redis://{redis_host}:{redis_port}/0",
    backend=f"redis://{redis_host}:{redis_port}/1"
)

celery_app.conf.task_routes = {
    "backend.tasks.workers.*": {"queue": "default"},
}