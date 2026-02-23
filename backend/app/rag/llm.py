import httpx
from app.config import settings

async def query_llm(context: str, question: str) -> str:
    """
    Send context + question to your LLM provider and get back the answer text.
    """
    prompt = f"{context}\n\nQuestion: {question}\nAnswer:"

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://openrouter.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",  # or your chosen LLM
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 300,
                "temperature": 0.2,
            },
        )

        response.raise_for_status()
        data = response.json()

    # Pull out the text answer
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"].strip()

    return "I couldn't generate a response."