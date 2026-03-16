from apps.db.models import Chunk, Document
from sqlmodel import select
from typing import Optional

def search_similar(session, embedding_vector, user_id, doc_ids: Optional[list[int]] = None, k=10):
    stmt = (
        select(Chunk, Document.filename)
        .join(Document)
        .where(Document.user_id == user_id)
    )

    if doc_ids:
        stmt = stmt.where(Chunk.document_id.in_(doc_ids))

    stmt = (
        stmt
        .order_by(Chunk.embedding.l2_distance(embedding_vector))
        .limit(k)
    )

    return session.exec(stmt).all()