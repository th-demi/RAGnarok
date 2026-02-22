from app.rag.embeddings import create_embeddings
import pdfplumber

async def extract_text(file):
    with pdfplumber.open(file.file) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

async def process_file(file):
    text = await extract_text(file)
    chunks = chunk_text(text)  # your existing chunking method
    embs = await create_embeddings([c["text"] for c in chunks])
    return [
        {"text": chunks[i], "embedding": embs[i], "source": file.filename}
        for i in range(len(chunks))
    ]