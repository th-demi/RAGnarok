from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str
    doc_id: int | None = None