from apps.rag.embeddings import create_embeddings
import pdfplumber

async def extract_text(file):
    with pdfplumber.open(file.file) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200):
    tokens = text.split()
    chunks = []
    start = 0
    while start < len(tokens):
        chunk = tokens[start:start + chunk_size]
        chunks.append({"text": " ".join(chunk)})
        start += chunk_size - overlap
    return chunks

async def process_file(file):
    print(f'Text extraction started========')
    text = await extract_text(file)
    print(f'extracted text : {text}')
    chunks = chunk_text(text)
    print(f'chunks : {chunks}')
    embs = await create_embeddings([c["text"] for c in chunks])
    print(f'embds : {embs}')
    return [
        {"text": chunks[i]["text"], "embedding": embs[i], "source": file.filename}
        for i in range(len(chunks))
    ]