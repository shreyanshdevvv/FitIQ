from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health
from app.db import check_database_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: test database connection and pgvector
    db_status = await check_database_connection()
    print(f"📡 FastAPI AI Service starting up...")
    print(f"📊 Database check: {db_status}")
    yield
    print("🛑 FastAPI AI Service shutting down...")

app = FastAPI(
    title="FitCoach AI Service",
    description="Dedicated AI microservice for LLMs, RAG, and Embeddings",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
