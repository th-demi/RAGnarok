CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX chunk_embedding_idx
ON chunk
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);