from fastapi import APIRouter, HTTPException, status
from app.models.schemas import UserCreate, UserResponse, Token
from app.models.store import store
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate):
    if store.get_user_by_username(body.username):
        raise HTTPException(status_code=409, detail="Username already taken")
    hashed = hash_password(body.password)
    user = store.create_user(body.username, hashed)
    return user


@router.post("/login", response_model=Token)
def login(body: UserCreate):
    user = store.get_user_by_username(body.username)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"])
    return {"access_token": token}
