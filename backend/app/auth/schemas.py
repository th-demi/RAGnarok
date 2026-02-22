from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    email: EmailStr
    is_verified: bool


class Token(BaseModel):
    access_token: str
    token_type: str
