from typing import List, Dict
from sqlalchemy import text
from app.db import AsyncSessionLocal
from app.rag.embedder import embedder

class VectorRetriever:
    async def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Embeds the query and performs a cosine similarity search against pgvector.
        Returns top_k most relevant chunks with similarity score.
        """
        query_vector = await embedder.embed_text(query)
        vector_str = f"[{','.join(str(x) for x in query_vector)}]"

        sql = text("""
            SELECT
                source_file,
                title,
                content,
                1 - (embedding <=> CAST(:query_vector AS vector)) AS similarity
            FROM knowledge_chunks
            ORDER BY embedding <=> CAST(:query_vector AS vector) ASC
            LIMIT :top_k
        """)

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                sql,
                {"query_vector": vector_str, "top_k": top_k}
            )
            rows = result.fetchall()

            return [
                {
                    "source_file": row.source_file,
                    "title": row.title,
                    "content": row.content,
                    "similarity": round(float(row.similarity), 4),
                }
                for row in rows
            ]

retriever = VectorRetriever()
