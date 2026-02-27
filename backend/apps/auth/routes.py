from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from apps.db.session import get_session
from apps.db.models import User
from apps.auth.schemas import UserCreate, Token
from apps.auth.jwt import create_access_token
from apps.auth.hash import hash_password, verify_password
from sqlmodel import select

router = APIRouter(prefix="/auth")


@router.post("/register")
def register(user: UserCreate, session=Depends(get_session)):
    existing = session.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    db_user = User(email=user.email, hashed_password=hashed)
    session.add(db_user)
    session.commit()

    return {"msg": "Registered successfully. You can now log in."}


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session=Depends(get_session),
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(user.hashed_password, form_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}