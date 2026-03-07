from apps.services.embedding_service import create_embeddings
import pdfplumber
import re

async def extract_text(file):
    with pdfplumber.open(file.file) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def split_sentences(text):
    return re.split(r'(?<=[.!?]) +', text)

def chunk_text(text, chunk_size=400, overlap=80):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)

    return chunks

async def process_file(file):
    text = await extract_text(file)
    chunks = chunk_text(text)
    if not chunks:
        return []

    embeddings = await create_embeddings(chunks)

    results = []
    for chunk, emb in zip(chunks, embeddings):
        results.append({
            "text": chunk,
            "embedding": emb,
            "source": file.filename
        })

    return results