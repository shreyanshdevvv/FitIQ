from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def check_database_connection() -> dict:
    """Verifies database connectivity and pgvector extension status."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
            
            ext_result = await conn.execute(
                text("SELECT extversion FROM pg_extension WHERE extname = 'vector'")
            )
            version = ext_result.scalar()
            
            return {
                "status": "connected",
                "pgvector": f"installed (v{version})" if version else "not installed"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

async def init_vector_table():
    """Initializes the knowledge_chunks table with pgvector support (768 dimensions for Gemini)."""
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        
        # Check existing table dimension; if changing from 1536 to 768, drop and recreate
        await conn.execute(text("""
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'knowledge_chunks' AND column_name = 'embedding'
                ) THEN
                    -- Check if dimension is not 768
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_attribute 
                        WHERE attrelid = 'knowledge_chunks'::regclass 
                        AND attname = 'embedding' 
                        AND atttypmod = 768 + 4
                    ) THEN
                        DROP TABLE IF EXISTS knowledge_chunks CASCADE;
                    END IF;
                END IF;
            END $$;
        """))

        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS knowledge_chunks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                source_file TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                title TEXT,
                content TEXT NOT NULL,
                embedding vector(768) NOT NULL,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(source_file, chunk_index)
            );
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
            ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
        """))
