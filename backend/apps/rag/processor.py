from apps.rag.cached_embeddings import get_cached_embedding
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
    # split on punctuation followed by space
    return re.split(r'(?<=[.!?]) +', text)

def recursive_chunk(text, max_tokens=600, overlap=80):
    paragraphs = text.split("\n\n")
    chunks = []
    for para in paragraphs:
        if len(para.split()) <= max_tokens:
            chunks.append(para)
        else:
            lines = para.split("\n")
            for line in lines:
                if len(line.split()) <= max_tokens:
                    chunks.append(line)
                else:
                    # now sentence chunk
                    sentences = split_sentences(line)
                    cur = []
                    for s in sentences:
                        cur += [s]
                        if len(" ".join(cur).split()) >= max_tokens:
                            chunks.append(" ".join(cur))
                            # overlap
                            cur = cur[-overlap:]
                    if cur:
                        chunks.append(" ".join(cur))
    return chunks

async def process_file(file):
    print(f'Text extraction started========')
    text = await extract_text(file)
    print(f'extracted text : {text}')
    chunks = recursive_chunk(text)
    print(f'chunks : {chunks}')
    embs = []
    for c in chunks:
        emb = await get_cached_embedding(c["text"])
        embs.append(emb)
    print(f'embds : {embs}')
    return [
        {"text": chunks[i]["text"], "embedding": embs[i], "source": file.filename}
        for i in range(len(chunks))
    ]