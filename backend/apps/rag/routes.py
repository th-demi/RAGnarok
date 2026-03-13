from fastapi import APIRouter, UploadFile, Depends, HTTPException
from apps.db.session import get_session
from apps.rag.schemas import AskRequest
from apps.rag.processor import process_file
from apps.rag.vector_store import search_similar
from apps.auth.jwt import get_current_user
from apps.rag.cached_embeddings import get_cached_embedding
from apps.services.llm_service import query_llm
from apps.db.models import Document, Chunk
from sqlmodel import select

router = APIRouter(prefix="/rag")

@router.get("/documents")
def list_docs(session=Depends(get_session), user=Depends(get_current_user)):
    docs = session.exec(select(Document).where(Document.user_id == user.id)).all()
    return docs

@router.delete("/document/{doc_id}")
def delete_document(
    doc_id: int,
    session=Depends(get_session),
    user=Depends(get_current_user)
):
    doc = session.get(Document, doc_id)

    if not doc or doc.user_id != user.id:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = session.exec(
        select(Chunk).where(Chunk.document_id == doc_id)
    ).all()

    for c in chunks:
        session.delete(c)

    session.delete(doc)

    session.commit()

    return {"status": "deleted"}

@router.post("/upload")
async def upload_file(file: UploadFile, session=Depends(get_session), user=Depends(get_current_user)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF allowed")

    contents = await file.read()

    if len(contents) > 10_000_000:
        raise HTTPException(status_code=400, detail="File too large. Max = 10MB")

    file.file.seek(0)

    doc = Document(filename=file.filename, user_id=user.id)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    chunks_data = await process_file(file)
    if not chunks_data:
        return {"status": "no_text_found"}
    for ch in chunks_data:
        chunk = Chunk(text=ch["text"], embedding=ch["embedding"], document_id=doc.id)
        session.add(chunk)
    session.commit()
    return {"status": "uploaded"}


@router.post("/ask")
async def ask_question(req: AskRequest, session=Depends(get_session), user=Depends(get_current_user)):
    q_emb = await get_cached_embedding(req.question)
    results = search_similar(session, q_emb, user.id, req.doc_id)
    seen = set()
    filtered = []

    for chunk, filename in results:
        if chunk.text not in seen:
            filtered.append((chunk, filename))
            seen.add(chunk.text)

    results = filtered
    context = "\n\n".join([r[0].text for r in results[:5]])
    answer = await query_llm(context, req.question)
    return {
        "answer": answer,
        "sources": [
            {"text": r[0].text, "filename": r[1]}
            for r in results
        ]
    }
