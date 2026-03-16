from pydantic import BaseModel
from typing import Optional

class AskRequest(BaseModel):
    question: str
    doc_id: Optional[int] = None
    doc_ids: Optional[list[int]] = None