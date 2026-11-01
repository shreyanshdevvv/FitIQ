from fastapi import APIRouter
from app.rag.pipeline import rag_pipeline

router = APIRouter(prefix="/api/v1/rag", tags=["RAG Knowledge Base"])

@router.post("/ingest")
async def trigger_ingestion():
    """Triggers ingestion and embedding of all knowledge markdown files into pgvector."""
    return await rag_pipeline.ingest_knowledge_base()
