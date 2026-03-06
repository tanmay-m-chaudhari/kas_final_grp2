from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, quotes, collections
from app.config.settings import get_settings

settings = get_settings()

app = FastAPI(title="QuoteForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")
app.include_router(collections.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "service": "quoteforge"}
