from apps.db.session import get_session
from apps.db.models import Chunk, Document
from sqlmodel import select
from pgvector.sqlalchemy import VECTOR


def store_chunks(session, chunks, user_id):
    for ch in chunks:
        chunk = Chunk(text=ch["text"], embedding=ch["embedding"], source=ch["source"], user_id=user_id)
        session.add(chunk)
    session.commit()

def search_similar(session, embedding_vector, user_id, doc_id=None, k=10):

    stmt = (
        select(Chunk, Document.filename)
        .join(Document)
        .where(Document.user_id == user_id)
        .order_by(Chunk.embedding.l2_distance(embedding_vector))
        .limit(k)
    )

    if doc_id:
        stmt = stmt.where(Chunk.document_id == doc_id)

    return session.exec(stmt).all()
