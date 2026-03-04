from apps.db.session import get_session
from apps.db.models import Chunk
from sqlmodel import select
from pgvector.sqlalchemy import VECTOR


def store_chunks(session, chunks, user_id):
    for ch in chunks:
        chunk = Chunk(text=ch["text"], embedding=ch["embedding"], source=ch["source"], user_id=user_id)
        session.add(chunk)
    session.commit()


def search_similar(session, embedding_vector, user_id, doc_id, k=10):
    # stmt = select(Chunk).order_by(Chunk.embedding.distance(embedding_vector))
    stmt = select(Chunk).where(Chunk.document_id == doc_id) if doc_id else select(Chunk).where(Chunk.document.has(user_id=user.id))
    return session.exec(stmt.limit(k)).all()
