from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from app.models.schemas import (
    QuoteCreate, QuoteUpdate, QuoteResponse, QuoteListResponse, Category
)
from app.models.store import store
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.get("/random", response_model=QuoteResponse)
def random_quote(category: Optional[Category] = None):
    quote = store.get_random_quote(category)
    if not quote:
        raise HTTPException(status_code=404, detail="No quotes found")
    return quote


@router.get("/", response_model=QuoteListResponse)
def list_quotes(
    category: Optional[Category] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    return store.list_quotes(category=category, author=author, search=search, page=page, limit=limit)


@router.post("/", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(body: QuoteCreate, current_user=Depends(get_current_user)):
    return store.create_quote(current_user["id"], body.model_dump())


@router.get("/mine", response_model=QuoteListResponse)
def my_quotes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    return store.list_quotes(owner_id=current_user["id"], page=page, limit=limit)


@router.get("/{quote_id}", response_model=QuoteResponse)
def get_quote(quote_id: str):
    quote = store.get_quote_by_id(quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@router.patch("/{quote_id}", response_model=QuoteResponse)
def update_quote(quote_id: str, body: QuoteUpdate, current_user=Depends(get_current_user)):
    quote = store.get_quote_by_id(quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    return store.update_quote(quote_id, updates)


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(quote_id: str, current_user=Depends(get_current_user)):
    quote = store.get_quote_by_id(quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    store.delete_quote(quote_id)


@router.post("/{quote_id}/like")
def toggle_like(quote_id: str, current_user=Depends(get_current_user)):
    if not store.get_quote_by_id(quote_id):
        raise HTTPException(status_code=404, detail="Quote not found")
    liked = store.toggle_like(current_user["id"], quote_id)
    return {"liked": liked}
