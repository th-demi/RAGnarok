from fastapi import APIRouter, UploadFile, Depends
from app.db.session import get_session
from app.rag.schemas import AskRequest
from app.rag.processor import process_file
from app.rag.vector_store import store_chunks, search_similar
from app.auth.jwt import get_current_user
from app.rag.embeddings import create_embeddings
from app.rag.llm import query_llm

router = APIRouter(prefix="/rag")


@router.post("/upload")
async def upload_file(file: UploadFile, session=Depends(get_session), user=Depends(get_current_user)):
    print(f'File processing started =============')
    chunks_data = await process_file(file)
    if not chunks_data:
        return {"status": "no_text_found"}
    print(f'Returned chunked data : {chunks_data}')
    store_chunks(session, chunks_data)
    return {"status": "uploaded"}


@router.post("/ask")
async def ask_question(req: AskRequest, session=Depends(get_session), user=Depends(get_current_user)):
    q_emb = (await create_embeddings([req.question]))[0]
    results = search_similar(session, q_emb)
    context = "\n".join([r.text for r in results])
    answer = await query_llm(context, req.question)
    return {
        "answer": answer,
        "sources": [{"text": r.text, "source": r.source} for r in results]
    }
