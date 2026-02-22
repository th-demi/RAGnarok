import os
import httpx
from app.config import settings


async def create_embeddings(texts: list[str]):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/v1/embeddings",
            headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"},
            json={"input": texts, "model": "text-embedding-3-large"},
        )
    return response.json()["data"]
