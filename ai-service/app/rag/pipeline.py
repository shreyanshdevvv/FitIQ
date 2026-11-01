from pathlib import Path
from typing import List, Dict
from sqlalchemy import text
from app.db import AsyncSessionLocal
from app.rag.chunker import chunker
from app.rag.embedder import embedder
from app.rag.retriever import retriever

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent.parent / "knowledge"

class RAGPipeline:
    async def ingest_knowledge_base(self) -> Dict:
        """
        Reads all markdown documents in knowledge/, splits into chunks,
        generates embeddings, and stores them in PostgreSQL with pgvector.
        """
        if not KNOWLEDGE_DIR.exists():
            return {"status": "error", "message": f"Directory {KNOWLEDGE_DIR} not found"}

        files = list(KNOWLEDGE_DIR.glob("*.md"))
        total_chunks = 0

        async with AsyncSessionLocal() as session:
            for file_path in files:
                content = file_path.read_text(encoding="utf-8")
                chunks = chunker.split_markdown(file_path.name, content)

                for chunk in chunks:
                    embedding = await embedder.embed_text(chunk["content"])
                    vector_str = f"[{','.join(str(x) for x in embedding)}]"

                    insert_sql = text("""
                        INSERT INTO knowledge_chunks (source_file, chunk_index, title, content, embedding)
                        VALUES (:source_file, :chunk_index, :title, :content, CAST(:embedding AS vector))
                        ON CONFLICT (source_file, chunk_index)
                        DO UPDATE SET
                            title = EXCLUDED.title,
                            content = EXCLUDED.content,
                            embedding = EXCLUDED.embedding,
                            created_at = NOW();
                    """)

                    await session.execute(insert_sql, {
                        "source_file": chunk["source_file"],
                        "chunk_index": chunk["chunk_index"],
                        "title": chunk["title"],
                        "content": chunk["content"],
                        "embedding": vector_str,
                    })
                    total_chunks += 1

            await session.commit()

        return {
            "status": "success",
            "files_processed": len(files),
            "chunks_stored": total_chunks,
        }

    async def query_with_rag(self, query: str, top_k: int = 3) -> Dict:
        """Retrieves relevant chunks and builds the grounded context string."""
        chunks = await retriever.retrieve(query, top_k=top_k)

        context_blocks = []
        sources = []
        for c in chunks:
            context_blocks.append(f"### Source: {c['source_file']} ({c['title']})\n{c['content']}")
            sources.append({
                "source_file": c["source_file"],
                "title": c["title"],
                "similarity_score": c["similarity"]
            })

        formatted_context = "\n\n".join(context_blocks)
        return {
            "context": formatted_context,
            "sources": sources,
        }

rag_pipeline = RAGPipeline()
