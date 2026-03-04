from fastapi import APIRouter, UploadFile, Depends, HTTPException
from apps.db.session import get_session
from apps.rag.schemas import AskRequest
from apps.rag.processor import process_file
from apps.rag.vector_store import store_chunks, search_similar
from apps.auth.jwt import get_current_user
from apps.rag.cached_embeddings import get_cached_embedding
from apps.rag.llm import query_llm
from apps.db.models import Document, Chunk

router = APIRouter(prefix="/rag")

@router.get("/documents")
def list_docs(session=Depends(get_session), user=Depends(get_current_user)):
    docs = session.exec(select(Document).where(Document.user_id == user.id)).all()
    return docs

@router.post("/upload")
async def upload_file(file: UploadFile, session=Depends(get_session), user=Depends(get_current_user)):
    if file.spool_max_size and file.spool_max_size > 10_000_000:
        raise HTTPException(400, "File too large. Max = 10MB")
    doc = Document(filename=file.filename, user_id=user.id)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    # print(f'File processing started =============')
    chunks_data = await process_file(file)
    if not chunks_data:
        return {"status": "no_text_found"}
    # print(f'Returned chunked data : {chunks_data}')
    for ch in chunks_data:
        chunk = Chunk(text=ch["text"], embedding=ch["embedding"], document_id=doc.id)
        session.add(chunk)
    session.commit()
    return {"status": "uploaded"}


@router.post("/ask")
async def ask_question(req: AskRequest, doc_id: int=None, session=Depends(get_session), user=Depends(get_current_user)):
    q_emb = await get_cached_embedding(req.question)
    # print(f'q_emb ======================== :, {q_emb}')
    results = search_similar(session, q_emb, user.id, doc_id)
    # print(f'results ======================== : {results}')
    context = "\n".join([r.text for r in results])
    # print(f'context ======================== : {context}')
    answer = await query_llm(context, req.question)
    # print(f'answer ======================== : {answer}')
    return {
        "answer": answer,
        "sources": [{"text": r.text, "source": r.source} for r in results]
    }
