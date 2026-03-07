from apps.db.models import Chunk, Document
from sqlmodel import select

def search_similar(session, embedding_vector, user_id, doc_id=None, k=10):

    stmt = (
        select(Chunk, Document.filename)
        .join(Document)
        .where(Document.user_id == user_id)
    )

    if doc_id is not None:
        stmt = stmt.where(Chunk.document_id == doc_id)

    stmt = (
        stmt
        .order_by(Chunk.embedding.l2_distance(embedding_vector))
        .limit(k)
    )

    return session.exec(stmt).all()