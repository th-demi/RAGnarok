from apps.db.session import get_session
from apps.db.models import Chunk
from sqlmodel import select
from pgvector.sqlalchemy import VECTOR


def store_chunks(session, chunks):
    for ch in chunks:
        chunk = Chunk(text=ch["text"],
                      embedding=ch["embedding"], source=ch["source"])
        session.add(chunk)
    session.commit()


def search_similar(session, embedding_vector, k=10):
    # stmt = select(Chunk).order_by(Chunk.embedding.distance(embedding_vector))
    stmt = select(Chunk).order_by(Chunk.embedding.l2_distance(embedding_vector))
    return session.exec(stmt.limit(k)).all()
