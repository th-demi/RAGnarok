from sqlmodel import create_engine, Session

from apps.config import settings

DATABASE_URL = (
    f"postgresql://{settings.POSTGRES_USER}:"
    f"{settings.POSTGRES_PASSWORD}@"
    f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/"
    f"{settings.POSTGRES_DB}"
)

engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    with Session(engine) as session:
        yield session
