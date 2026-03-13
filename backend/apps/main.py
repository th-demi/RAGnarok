from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, text
from apps.middleware.rate_limiter import rate_limit_middleware
from apps.config import settings
from apps.auth.routes import router as auth_router
from apps.rag.routes import router as rag_router
from apps.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        session.exec(text("CREATE EXTENSION IF NOT EXISTS vector"))
        session.exec(text("""
            CREATE INDEX IF NOT EXISTS chunk_embedding_idx
            ON chunk USING hnsw (embedding vector_l2_ops)
        """))
        session.commit()
    yield


app = FastAPI(lifespan=lifespan)
app.middleware("http")(rate_limit_middleware)

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