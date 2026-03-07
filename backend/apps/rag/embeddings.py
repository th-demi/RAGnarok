import httpx
from apps.config import settings

BATCH_SIZE = 30

async def create_embeddings(texts: list[str]):
    texts = [t.strip() for t in texts if t.strip()]
    all_embeddings = []

    async with httpx.AsyncClient(timeout=30) as client:

        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i+BATCH_SIZE]
            response = await client.post(
                "https://openrouter.ai/api/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "text-embedding-3-large",
                    "input": batch
                }
            )

            data = response.json()
            if "data" not in data:
                raise RuntimeError(data)
            all_embeddings.extend(
                [item["embedding"] for item in data["data"]]
            )

    return all_embeddings