from sqlmodel import SQLModel, Field, Relationship
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column


class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str


class Document(SQLModel, table=True):
    id: int = Field(primary_key=True)
    filename: str
    user_id: int = Field(foreign_key="user.id", index=True)

    chunks: list["Chunk"] = Relationship(back_populates="document")

class Chunk(SQLModel, table=True):
    id: int = Field(primary_key=True)
    text: str
    embedding: list[float] = Field(sa_column=Column(Vector(3072)))
    document_id: int = Field(foreign_key="document.id", index=True)

    document: "Document" = Relationship(back_populates="chunks")