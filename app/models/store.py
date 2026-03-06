import uuid
from datetime import datetime
from typing import Optional
from .schemas import Category


class InMemoryStore:
    def __init__(self):
        self._users: dict = {}
        self._quotes: dict = {}
        self._collections: dict = {}
        self._likes: set = set()

    def create_user(self, username: str, hashed_password: str) -> dict:
        uid = str(uuid.uuid4())
        user = {
            "id": uid,
            "username": username,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
        }
        self._users[uid] = user
        return user

    def get_user_by_username(self, username: str) -> Optional[dict]:
        return next((u for u in self._users.values() if u["username"] == username), None)

    def get_user_by_id(self, uid: str) -> Optional[dict]:
        return self._users.get(uid)

    def create_quote(self, owner_id: str, data: dict) -> dict:
        qid = str(uuid.uuid4())
        now = datetime.utcnow()
        quote = {
            "id": qid,
            "owner_id": owner_id,
            "text": data["text"],
            "author": data["author"],
            "category": data["category"],
            "source": data.get("source"),
            "tags": data.get("tags", []),
            "likes": 0,
            "created_at": now,
            "updated_at": now,
        }
        self._quotes[qid] = quote
        return quote

    def get_quote_by_id(self, qid: str) -> Optional[dict]:
        return self._quotes.get(qid)

    def list_quotes(
        self,
        category: Optional[str] = None,
        author: Optional[str] = None,
        search: Optional[str] = None,
        owner_id: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> dict:
        items = list(self._quotes.values())
        if category:
            items = [q for q in items if q["category"] == category]
        if author:
            items = [q for q in items if author.lower() in q["author"].lower()]
        if search:
            q_lower = search.lower()
            items = [q for q in items if q_lower in q["text"].lower() or q_lower in q["author"].lower()]
        if owner_id:
            items = [q for q in items if q["owner_id"] == owner_id]

        items.sort(key=lambda x: x["created_at"], reverse=True)
        total = len(items)
        start = (page - 1) * limit
        return {
            "items": items[start:start + limit],
            "total": total,
            "page": page,
            "total_pages": max(1, -(-total // limit)),
        }

    def update_quote(self, qid: str, updates: dict) -> Optional[dict]:
        quote = self._quotes.get(qid)
        if not quote:
            return None
        for k, v in updates.items():
            if v is not None:
                quote[k] = v
        quote["updated_at"] = datetime.utcnow()
        return quote

    def delete_quote(self, qid: str) -> bool:
        return self._quotes.pop(qid, None) is not None

    def toggle_like(self, user_id: str, quote_id: str) -> bool:
        key = (user_id, quote_id)
        quote = self._quotes.get(quote_id)
        if not quote:
            return False
        if key in self._likes:
            self._likes.discard(key)
            quote["likes"] = max(0, quote["likes"] - 1)
            return False
        else:
            self._likes.add(key)
            quote["likes"] += 1
            return True

    def get_random_quote(self, category: Optional[str] = None) -> Optional[dict]:
        import random
        items = list(self._quotes.values())
        if category:
            items = [q for q in items if q["category"] == category]
        return random.choice(items) if items else None

    def create_collection(self, owner_id: str, data: dict) -> dict:
        cid = str(uuid.uuid4())
        collection = {
            "id": cid,
            "owner_id": owner_id,
            "name": data["name"],
            "description": data.get("description"),
            "is_public": data.get("is_public", False),
            "quote_ids": [],
            "created_at": datetime.utcnow(),
        }
        self._collections[cid] = collection
        return collection

    def get_collection_by_id(self, cid: str) -> Optional[dict]:
        return self._collections.get(cid)

    def add_quote_to_collection(self, cid: str, qid: str) -> bool:
        col = self._collections.get(cid)
        if not col or qid in col["quote_ids"]:
            return False
        col["quote_ids"].append(qid)
        return True

    def get_collection_quotes(self, cid: str) -> list:
        col = self._collections.get(cid)
        if not col:
            return []
        return [self._quotes[qid] for qid in col["quote_ids"] if qid in self._quotes]


store = InMemoryStore()
