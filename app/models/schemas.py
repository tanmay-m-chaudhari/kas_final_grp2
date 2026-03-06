from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Category(str, Enum):
    MOTIVATION = "motivation"
    WISDOM = "wisdom"
    HUMOR = "humor"
    LOVE = "love"
    PHILOSOPHY = "philosophy"
    SCIENCE = "science"


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: str
    username: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class QuoteCreate(BaseModel):
    text: str = Field(min_length=5, max_length=2000)
    author: str = Field(min_length=1, max_length=200)
    category: Category = Category.WISDOM
    source: Optional[str] = None
    tags: list[str] = []


class QuoteUpdate(BaseModel):
    text: Optional[str] = Field(default=None, min_length=5, max_length=2000)
    author: Optional[str] = Field(default=None, min_length=1, max_length=200)
    category: Optional[Category] = None
    source: Optional[str] = None
    tags: Optional[list[str]] = None


class QuoteResponse(BaseModel):
    id: str
    text: str
    author: str
    category: Category
    source: Optional[str]
    tags: list[str]
    owner_id: str
    likes: int
    created_at: datetime
    updated_at: datetime


class QuoteListResponse(BaseModel):
    items: list[QuoteResponse]
    total: int
    page: int
    total_pages: int


class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    is_public: bool = False


class CollectionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    is_public: bool
    owner_id: str
    quote_count: int
    created_at: datetime
