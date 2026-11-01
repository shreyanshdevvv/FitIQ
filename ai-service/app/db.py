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
            # Test query
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
            
            # Check vector extension
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
