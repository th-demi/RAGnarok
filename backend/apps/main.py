from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.middleware.rate_limiter import rate_limit_middleware
from apps.config import settings
from apps.auth.routes import router as auth_router
from apps.rag.routes import router as rag_router

from sqlmodel import SQLModel
from apps.db.session import engine

app = FastAPI()
app.middleware("http")(rate_limit_middleware)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

origins = [settings.FRONTEND_BASE_URL]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(rag_router)
