from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://fitcoach:fitcoach_dev@localhost:5435/fitcoach_db"
    AI_SERVICE_API_KEY: str = "dev-internal-secret-token"
    AI_SERVICE_PORT: int = 8000
    
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-3.5-flash"
    EMBEDDING_MODEL: str = "gemini-embedding-001"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        extra="ignore"
    )

settings = Settings()

# Clean connection string for asyncpg (asyncpg does not accept channel_binding or sslmode parameters)
db_url = settings.DATABASE_URL
if "channel_binding=" in db_url:
    import re
    db_url = re.sub(r'[?&]channel_binding=[^&]+', '', db_url)
    if '?' not in db_url and '&' in db_url:
        db_url = db_url.replace('&', '?', 1)

if "sslmode=" in db_url:
    import re
    db_url = re.sub(r'sslmode=[^&]+', 'ssl=require', db_url)

if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

settings.DATABASE_URL = db_url
