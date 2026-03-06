from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import CollectionCreate, CollectionResponse, QuoteResponse
from app.models.store import store
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/collections", tags=["collections"])


def _to_response(col: dict) -> dict:
    return {**col, "quote_count": len(col.get("quote_ids", []))}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_collection(body: CollectionCreate, current_user=Depends(get_current_user)):
    col = store.create_collection(current_user["id"], body.model_dump())
    return _to_response(col)


@router.get("/{collection_id}")
def get_collection(collection_id: str, current_user=Depends(get_current_user)):
    col = store.get_collection_by_id(collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    if not col["is_public"] and col["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return _to_response(col)


@router.post("/{collection_id}/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_quote(collection_id: str, quote_id: str, current_user=Depends(get_current_user)):
    col = store.get_collection_by_id(collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    if col["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not store.get_quote_by_id(quote_id):
        raise HTTPException(status_code=404, detail="Quote not found")
    store.add_quote_to_collection(collection_id, quote_id)


@router.get("/{collection_id}/quotes", response_model=list[QuoteResponse])
def list_collection_quotes(collection_id: str, current_user=Depends(get_current_user)):
    col = store.get_collection_by_id(collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    if not col["is_public"] and col["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return store.get_collection_quotes(collection_id)
