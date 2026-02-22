from fastapi import APIRouter, UploadFile, Depends
from app.db.session import get_session
from app.rag.processor import process_file
from app.rag.vector_store import store_chunks, search_similar
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/rag")


@router.post("/upload")
async def upload_file(file: UploadFile, session=Depends(get_session), user=Depends(get_current_user)):
    chunks_data = await process_file(file)
    store_chunks(session, chunks_data)
    return {"status": "uploaded"}


@router.post("/ask")
async def ask_question(question: str, session=Depends(get_session), user=Depends(get_current_user)):
    q_emb = (await create_embeddings([question]))[0]
    results = search_similar(session, q_emb)
    context = "\n".join([r.text for r in results])

    prompt = f"Answer based on context:\n{context}\n\nQuestion: {question}"
    llm_resp = await query_llm(prompt)
    return {"answer": llm_resp}
