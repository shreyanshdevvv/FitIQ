from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, generate, chat, summary, rag, nutrition
from app.db import check_database_connection, init_vector_table
from app.rag.pipeline import rag_pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    print("📡 FastAPI AI Service starting up...")
    db_status = await check_database_connection()
    print(f"📊 Database check: {db_status}")

    # Ensure pgvector table exists
    await init_vector_table()
    print("✅ pgvector knowledge_chunks table verified.")

    # Automatically ingest fitness knowledge base
    ingest_result = await rag_pipeline.ingest_knowledge_base()
    print(f"📚 Knowledge Base Ingestion: {ingest_result}")

    yield
    print("🛑 FastAPI AI Service shutting down...")

app = FastAPI(
    title="FitCoach AI Service",
    description="Dedicated microservice for LLMs, RAG, and Embeddings",
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
app.include_router(generate.router)
app.include_router(chat.router)
app.include_router(summary.router)
app.include_router(rag.router)
app.include_router(nutrition.router)
