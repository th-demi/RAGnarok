from sqlmodel import SQLModel, Field
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column


class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str


class Chunk(SQLModel, table=True):
    id: int = Field(primary_key=True)
    text: str
    embedding: list[float] = Field(sa_column=Column(Vector(3072)), exclude=True)
    source: str