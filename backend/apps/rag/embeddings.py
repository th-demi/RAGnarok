import httpx
from apps.config import settings

async def create_embeddings(texts: list[str]):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/embeddings",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "input": texts,
                "model": "text-embedding-3-large"
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        if "data" not in data:
            raise RuntimeError(f"Unexpected embedding API response: {data}")

        return [item["embedding"] for item in data["data"]]